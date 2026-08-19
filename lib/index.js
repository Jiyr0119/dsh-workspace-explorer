import { open, readFile, readdir, stat } from "node:fs/promises";
import { basename, join } from "node:path";
/** @internal 运行期配置(供单元测试调整),不构成公开 API。 */
const cfg = {
	ignore: [...[
		".git",
		"node_modules",
		"__pycache__",
		".venv",
		"venv",
		".pytest_cache",
		".ruff_cache",
		".mypy_cache",
		"dist",
		"build",
		".next",
		".nuxt",
		"coverage",
		".idea",
		"target"
	]],
	max: 400,
	peekMaxLines: 60
};
const WHOLE_MAX_BYTES = 32768;
const SMALL_FILE_MAX = 4194304;
const PAGE_SCAN_CHUNK = 262144;
const TREE_MAX_DEPTH = 6;
const TREE_MAX_ENTRIES = 200;
const MAX_CACHED_LINES = 2e6;
const LINE_CACHE_MAX_FILES = 64;
/** @internal 大文件行起始字节缓存(key=绝对路径),供单元测试断言,不构成公开 API。 */
const lineIndexCache = /* @__PURE__ */ new Map();
async function readJsonBody(req) {
	let raw = "";
	for await (const chunk of req) raw += typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf-8");
	try {
		const parsed = JSON.parse(raw);
		return parsed !== null && typeof parsed === "object" ? parsed : {};
	} catch {
		return {};
	}
}
function writeJson(res, value, status = 200) {
	res.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"cache-control": "no-cache"
	});
	res.end(JSON.stringify(value));
}
/** @internal 把「工作区根目录 + 相对路径」解析为绝对路径,并校验 rel 不含危险段。 */
function resolveRel(root, rel) {
	if (root === "") return { error: "missing-root" };
	if (rel !== "") {
		if (rel.split("/").some((s) => s === "" || s === "." || s === "..")) return { error: "bad-rel" };
	}
	return { abs: rel === "" ? root : root.replace(/\/+$/, "") + "/" + rel };
}
/** @internal 列一个目录层级(目录优先、按名排序、噪声目录过滤、400 上限)。 */
async function listDir(abs, baseRel) {
	const dirents = await readdir(abs, { withFileTypes: true });
	const out = [];
	for (const d of dirents) {
		if (d.name === ".DS_Store") continue;
		if (d.isDirectory() && cfg.ignore.includes(d.name)) continue;
		const target = join(abs, d.name);
		let size = null;
		if (d.isFile()) try {
			size = (await stat(target)).size;
		} catch {}
		out.push({
			name: d.name,
			type: d.isDirectory() ? "directory" : "file",
			path: target,
			rel: baseRel === "" ? d.name : baseRel + "/" + d.name,
			size
		});
	}
	out.sort((a, b) => a.type !== b.type ? a.type === "directory" ? -1 : 1 : a.name.localeCompare(b.name));
	const truncated = out.length > cfg.max;
	return {
		entries: truncated ? out.slice(0, cfg.max) : out,
		truncated
	};
}
/**
* 按行读取 [offset, offset+limit) 一页内容。
* 小文件(≤4MB)整读、行数精确;大文件块扫描定位行区间,行数未知(null)。
*/
/** @internal 按行读取一页内容。 */
async function readLinesPage(abs, offset, limit) {
	const size = (await stat(abs)).size;
	if (size <= SMALL_FILE_MAX) {
		const lines = (await readFile(abs)).toString("utf-8").split("\n");
		if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
		const page = lines.slice(offset, offset + limit);
		return {
			content: page.join("\n"),
			startLine: offset,
			lineCount: lines.length,
			hasMore: offset + page.length < lines.length
		};
	}
	return pageScanLarge(abs, size, offset, limit);
}
/** @internal 大文件分页:增量缓存每行起始字节,翻页复用已扫描结果,避免每页从头重扫 O(n)。 */
async function pageScanLarge(abs, size, offset, limit) {
	const target = offset + limit;
	const fh = await open(abs, "r");
	try {
		if (target > MAX_CACHED_LINES) {
			let pos = 0;
			let newlines = 0;
			let startByte = offset === 0 ? 0 : -1;
			let endByte = -1;
			while (pos < size && endByte === -1) {
				const want = Math.min(PAGE_SCAN_CHUNK, size - pos);
				const chunk = Buffer.allocUnsafe(want);
				await fh.read(chunk, 0, want, pos);
				let idx = chunk.indexOf(10);
				while (idx !== -1) {
					newlines++;
					if (newlines === offset) startByte = pos + idx + 1;
					if (newlines === target) {
						endByte = pos + idx + 1;
						break;
					}
					idx = chunk.indexOf(10, idx + 1);
				}
				pos += want;
			}
			if (startByte === -1) startByte = size;
			if (endByte === -1) endByte = size;
			const len = endByte - startByte;
			const buf = len > 0 ? Buffer.allocUnsafe(len) : Buffer.alloc(0);
			if (len > 0) await fh.read(buf, 0, len, startByte);
			return {
				content: buf.toString("utf-8").replace(/\n$/, ""),
				startLine: offset,
				lineCount: null,
				hasMore: endByte < size
			};
		}
		let cached = lineIndexCache.get(abs);
		if (!cached || cached.size !== size) {
			if (lineIndexCache.size >= LINE_CACHE_MAX_FILES) lineIndexCache.clear();
			cached = {
				offsets: [0],
				scannedBytes: 0,
				size
			};
			lineIndexCache.set(abs, cached);
		}
		while (cached.offsets.length <= target && cached.scannedBytes < size) {
			const pos = cached.scannedBytes;
			const want = Math.min(PAGE_SCAN_CHUNK, size - pos);
			const chunk = Buffer.allocUnsafe(want);
			await fh.read(chunk, 0, want, pos);
			let idx = chunk.indexOf(10);
			while (idx !== -1) {
				cached.offsets.push(pos + idx + 1);
				idx = chunk.indexOf(10, idx + 1);
			}
			cached.scannedBytes = pos + want;
		}
		const startByte = offset < cached.offsets.length ? cached.offsets[offset] : size;
		const endByte = target < cached.offsets.length ? cached.offsets[target] : size;
		const len = endByte - startByte;
		const buf = len > 0 ? Buffer.allocUnsafe(len) : Buffer.alloc(0);
		if (len > 0) await fh.read(buf, 0, len, startByte);
		const fullyScanned = cached.scannedBytes >= size;
		const lastOffset = cached.offsets[cached.offsets.length - 1];
		const lineCount = fullyScanned ? cached.offsets.length - (lastOffset === size ? 1 : 0) : null;
		return {
			content: buf.toString("utf-8").replace(/\n$/, ""),
			startLine: offset,
			lineCount,
			hasMore: endByte < size
		};
	} finally {
		await fh.close();
	}
}
/** @internal 嗅探是否二进制(NUL 字节),只读前 8KB。 */
async function sniffBinary(abs, size) {
	const probe = Buffer.alloc(Math.min(8192, size));
	if (probe.length === 0) return false;
	const fh = await open(abs, "r");
	try {
		await fh.read(probe, 0, probe.length, 0);
	} finally {
		await fh.close();
	}
	return probe.includes(0);
}
/** @internal 递归收集目录树节点(树根相对 rel 从 '' 开始;受深度/条目预算限制)。 */
async function buildTreeNodes(abs, rel, depth, budget, out) {
	if (depth < 0 || budget.remaining <= 0) return;
	const { entries } = await listDir(abs, rel);
	for (const e of entries) {
		if (budget.remaining <= 0) break;
		out.push({
			name: e.name,
			type: e.type,
			rel: e.rel
		});
		budget.remaining--;
		if (e.type === "directory") await buildTreeNodes(e.path, e.rel, depth - 1, budget, out);
	}
}
var src_default = {
	inject: ["webServer"],
	apply(ctx) {
		const routes = [
			{
				kind: "exact",
				path: "/dsh-we/api/config",
				handler: async (req, res) => {
					const body = await readJsonBody(req);
					if (Array.isArray(body.ignore)) cfg.ignore = body.ignore.map((s) => String(s)).filter((s) => s !== "");
					if (typeof body.max === "number" && body.max >= 1 && body.max <= 2e3) cfg.max = Math.floor(body.max);
					if (typeof body.peekMaxLines === "number" && body.peekMaxLines >= 10 && body.peekMaxLines <= 500) cfg.peekMaxLines = Math.floor(body.peekMaxLines);
					return writeJson(res, {
						ok: true,
						ignore: cfg.ignore,
						max: cfg.max,
						peekMaxLines: cfg.peekMaxLines
					});
				}
			},
			{
				kind: "exact",
				path: "/dsh-we/api/list",
				handler: async (req, res) => {
					const body = await readJsonBody(req);
					const rel = String(body.rel ?? "");
					const resolved = resolveRel(String(body.root ?? body.path ?? ""), rel);
					if ("error" in resolved) return writeJson(res, {
						ok: false,
						error: resolved.error
					});
					const abs = resolved.abs;
					try {
						const { entries, truncated } = await listDir(abs, rel);
						return writeJson(res, {
							ok: true,
							path: abs,
							rel,
							entries,
							truncated
						});
					} catch (err) {
						return writeJson(res, {
							ok: false,
							error: err instanceof Error ? err.message : String(err)
						});
					}
				}
			},
			{
				kind: "exact",
				path: "/dsh-we/api/peek",
				handler: async (req, res) => {
					const body = await readJsonBody(req);
					const resolved = resolveRel(String(body.root ?? ""), String(body.rel ?? ""));
					if ("error" in resolved) return writeJson(res, {
						ok: false,
						error: resolved.error
					});
					const path = resolved.abs;
					try {
						const size = (await stat(path)).size;
						if (await sniffBinary(path, size)) return writeJson(res, {
							ok: true,
							binary: true,
							size,
							lineCount: null,
							startLine: 0,
							content: "",
							hasMore: false
						});
						if (body.whole === true && size <= WHOLE_MAX_BYTES) {
							const lines = (await readFile(path)).toString("utf-8").split("\n");
							if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
							return writeJson(res, {
								ok: true,
								binary: false,
								size,
								lineCount: lines.length,
								startLine: 0,
								content: lines.join("\n"),
								hasMore: false
							});
						}
						return writeJson(res, {
							ok: true,
							binary: false,
							size,
							...await readLinesPage(path, Math.max(0, Math.floor(Number(body.offset) || 0)), Math.min(2e3, Math.max(1, Math.floor(Number(body.limit) || cfg.peekMaxLines))))
						});
					} catch (err) {
						return writeJson(res, {
							ok: false,
							error: err instanceof Error ? err.message : String(err)
						});
					}
				}
			},
			{
				kind: "exact",
				path: "/dsh-we/api/tree",
				handler: async (req, res) => {
					const body = await readJsonBody(req);
					const resolved = resolveRel(String(body.root ?? ""), String(body.rel ?? ""));
					if ("error" in resolved) return writeJson(res, {
						ok: false,
						error: resolved.error
					});
					const path = resolved.abs;
					const depth = Math.min(TREE_MAX_DEPTH, Math.max(1, Math.floor(Number(body.depth) || 3)));
					const maxEntries = Math.min(1e3, Math.max(1, Math.floor(Number(body.maxEntries) || TREE_MAX_ENTRIES)));
					try {
						const name = basename(path.replace(/\/+$/, "")) || basename(path);
						const entries = [];
						const budget = { remaining: maxEntries };
						await buildTreeNodes(path, "", depth, budget, entries);
						return writeJson(res, {
							ok: true,
							name,
							entries,
							entryCount: entries.length,
							truncated: budget.remaining <= 0
						});
					} catch (err) {
						return writeJson(res, {
							ok: false,
							error: err instanceof Error ? err.message : String(err)
						});
					}
				}
			}
		];
		for (const route of routes) ctx.webServer.register(route);
	}
};
//#endregion
export { buildTreeNodes, cfg, src_default as default, lineIndexCache, listDir, pageScanLarge, readLinesPage, resolveRel, sniffBinary };
