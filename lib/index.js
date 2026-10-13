import { open, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import z from "@deepseek-ai/schemastery";
//#region src/index.ts
/**
* dsh-workspace-explorer — Host 半区(原生包)
*
* 通过 webServer 注册 /dsh-we/api/* JSON 路由(list/peek/tree/search/config),供浏览器客户端调用。
* - list : 列一个目录层级(懒加载)
* - peek : 按行分页读取文本文件(offset/limit),支持「插入完整内容」(whole,≤32KB)
* - tree : 递归生成目录树节点(限深/限条目),供目录拖拽与多选批量插入
* - search: 内容搜索(工作区内文本文件逐行匹配,限文件数/命中数/文件大小)
* - config: 运行期配置(噪声目录 / 最大条目 / 预览行数);面板设置经 Config(volatile)持久化到 Profile
*
* 安全边界:list/peek/tree/search 全部以「工作区根目录 + 相对路径」寻址,服务端校验 rel
* 不含 ''/./.. 段,任何文件读写都被约束在工作区根目录内,杜绝任意路径读取。
*/
const DEFAULT_IGNORED = [
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
];
/** @internal 运行期配置(供单元测试调整),不构成公开 API。 */
const cfg = {
	ignore: [...DEFAULT_IGNORED],
	max: 400,
	peekMaxLines: 60
};
const WHOLE_MAX_BYTES = 32768;
const SMALL_FILE_MAX = 4194304;
const PAGE_SCAN_CHUNK = 262144;
const TREE_MAX_DEPTH = 10;
const TREE_MAX_ENTRIES = 5e3;
const MAX_CACHED_LINES = 2e6;
const LINE_CACHE_MAX_FILES = 64;
const SEARCH_MAX_HITS = 100;
const SEARCH_MAX_FILES = 4e3;
const SEARCH_MAX_FILE_BYTES = 1048576;
const SEARCH_MAX_PER_FILE = 3;
const SEARCH_SNIPPET_BEFORE = 40;
const SEARCH_SNIPPET_AFTER = 80;
const SEARCH_SNIPPET_MAX = 400;
/** 内容搜索永远跳过的目录名(即使用户在树里关闭了噪声过滤,也不爬 node_modules 等)。 */
const SEARCH_ALWAYS_IGNORED = new Set(DEFAULT_IGNORED);
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
/**
* @internal 工作区内容搜索:逐行子串匹配(大小写不敏感)。
*
* 安全与性能边界:
* - 路径经 resolveRel 约束在 root 内;噪声目录(DEFAULT_IGNORED ∪ cfg.ignore)不进入;
* - 二进制(sniffBinary)与 >maxFileBytes 的文件跳过;
* - 受 maxFiles / maxHits / maxPerFile 三重上限约束,超限置 truncated 并立即停止。
*/
async function searchContent(root, query, opts = {}) {
	const needle = query.trim().toLowerCase();
	if (needle === "") return {
		ok: true,
		hits: [],
		scanned: 0,
		truncated: false
	};
	const resolved = resolveRel(root, "");
	if ("error" in resolved) return {
		ok: false,
		error: resolved.error,
		hits: [],
		scanned: 0,
		truncated: false
	};
	const maxHits = Math.max(1, opts.maxHits ?? SEARCH_MAX_HITS);
	const maxFiles = Math.max(1, opts.maxFiles ?? SEARCH_MAX_FILES);
	const maxFileBytes = Math.max(1, opts.maxFileBytes ?? SEARCH_MAX_FILE_BYTES);
	const maxPerFile = Math.max(1, opts.maxPerFile ?? SEARCH_MAX_PER_FILE);
	const hits = [];
	let scanned = 0;
	let truncated = false;
	const scanFile = async (abs, rel, name) => {
		if (truncated || hits.length >= maxHits) return;
		try {
			const info = await stat(abs);
			if (!info.isFile() || info.size === 0 || info.size > maxFileBytes) return;
			if (await sniffBinary(abs, info.size)) return;
			const lines = (await readFile(abs)).toString("utf-8").split("\n");
			const lowerLines = lines.map((l) => l.toLowerCase());
			let perFile = 0;
			for (let i = 0; i < lines.length && perFile < maxPerFile; i++) {
				if (hits.length >= maxHits) {
					truncated = true;
					break;
				}
				const start = lowerLines[i].indexOf(needle);
				if (start === -1) continue;
				const end = start + needle.length;
				const winStart = Math.max(0, start - SEARCH_SNIPPET_BEFORE);
				const rawWin = lines[i].slice(winStart, end + SEARCH_SNIPPET_AFTER);
				const snippet = rawWin.length > SEARCH_SNIPPET_MAX ? rawWin.slice(0, SEARCH_SNIPPET_MAX) : rawWin;
				hits.push({
					rel,
					name,
					line: i + 1,
					text: snippet,
					start: start - winStart,
					end: Math.min(snippet.length, end - winStart)
				});
				perFile++;
			}
		} catch {}
	};
	const walk = async (abs, rel) => {
		if (truncated || scanned >= maxFiles) return;
		let dirents;
		try {
			dirents = await readdir(abs, { withFileTypes: true });
		} catch {
			return;
		}
		for (const d of dirents) {
			if (truncated || scanned >= maxFiles) {
				truncated = true;
				return;
			}
			const childAbs = join(abs, d.name);
			const childRel = rel === "" ? d.name : `${rel}/${d.name}`;
			if (d.isDirectory()) {
				if (SEARCH_ALWAYS_IGNORED.has(d.name) || cfg.ignore.includes(d.name)) continue;
				await walk(childAbs, childRel);
			} else if (d.isFile()) {
				scanned++;
				await scanFile(childAbs, childRel, d.name);
			}
		}
	};
	await walk(resolved.abs, "");
	if (scanned >= maxFiles || hits.length >= maxHits) truncated = true;
	return {
		ok: true,
		hits,
		scanned,
		truncated
	};
}
/**
* 插件持久化配置(DSH 0.1.7+ settings 域)。
*
* 声明在 Host 入口上后,DSH 会把带 `.volatile()` 的字段投影为「可热编辑」表单:
* - 持久化到当前 Profile 的组合配置(重启后依然生效);
* - Web 设置页 / 插件管理器可直接编辑,无需重挂载插件;
* - 客户端经 `configForms.get('workspace-explorer')` 读写同一份值。
*
* 字段集合必须与客户端 WsCfg(面板设置)一一对应,顺序即展示顺序。
*/
const Config = z.object({
	hideNoise: z.boolean().default(true).volatile(),
	showSize: z.boolean().default(true).volatile(),
	refStyle: z.union(["relative", "absolute"]).default("relative").volatile(),
	peekLines: z.union([
		30,
		60,
		120
	]).default(60).volatile(),
	width: z.union([
		320,
		384,
		480
	]).default(384).volatile()
});
/** 读取 volatile 配置句柄(或裸值)中的布尔值,失败返回 fallback。 */
function readBool(v, fallback) {
	let raw = v;
	if (typeof v === "object" && v !== null && typeof v.get === "function") try {
		raw = v.get();
	} catch {
		raw = void 0;
	}
	return typeof raw === "boolean" ? raw : fallback;
}
/** 读取 volatile 配置句柄(或裸值)中的有限数字,失败返回 fallback。 */
function readNum(v, fallback) {
	let raw = v;
	if (typeof v === "object" && v !== null && typeof v.get === "function") try {
		raw = v.get();
	} catch {
		raw = void 0;
	}
	return typeof raw === "number" && Number.isFinite(raw) ? raw : fallback;
}
var src_default = {
	inject: ["webServer"],
	Config,
	apply(ctx, config) {
		if (config !== void 0 && config !== null && typeof config === "object") {
			cfg.ignore = readBool(config.hideNoise, true) ? [...DEFAULT_IGNORED] : [];
			cfg.peekMaxLines = Math.min(500, Math.max(10, Math.floor(readNum(config.peekLines, 60))));
		}
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
					const maxEntries = Math.min(TREE_MAX_ENTRIES, Math.max(1, Math.floor(Number(body.maxEntries) || 200)));
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
			},
			{
				kind: "exact",
				path: "/dsh-we/api/search",
				handler: async (req, res) => {
					const body = await readJsonBody(req);
					return writeJson(res, await searchContent(String(body.root ?? ""), String(body.q ?? body.query ?? "")));
				}
			},
			{
				kind: "exact",
				path: "/dsh-we/api/write",
				handler: async (req, res) => {
					const body = await readJsonBody(req);
					const resolved = resolveRel(String(body.root ?? ""), String(body.rel ?? ""));
					if ("error" in resolved) return writeJson(res, {
						ok: false,
						error: resolved.error
					});
					const abs = resolved.abs;
					const content = typeof body.content === "string" ? body.content : null;
					if (content === null) return writeJson(res, {
						ok: false,
						error: "missing-content"
					});
					try {
						if (typeof body.expectedSize === "number") try {
							const info = await stat(abs);
							if (info.size !== body.expectedSize) return writeJson(res, {
								ok: false,
								error: "file-changed",
								currentSize: info.size
							});
						} catch {}
						await writeFile(abs, content, "utf-8");
						return writeJson(res, {
							ok: true,
							size: (await stat(abs)).size
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
export { Config, buildTreeNodes, cfg, src_default as default, lineIndexCache, listDir, pageScanLarge, readLinesPage, resolveRel, searchContent, sniffBinary };
