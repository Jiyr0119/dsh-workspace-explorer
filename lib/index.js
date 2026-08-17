import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
//#region src/index.ts
/**
* dsh-workspace-explorer — Host 半区(原生包)
*
* 通过 webServer 注册 /dsh-we/api/* JSON 路由(list/peek),供浏览器客户端调用。
* 结构镜像 dsh-better-sidebar 的第三方 Host 模式:webServer.register({kind,path,handler})。
*/
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
	peekMaxBytes: 204800,
	peekMaxLines: 60
};
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
/** 列一个目录层级(目录优先、按名排序、噪声目录过滤、400 上限)。 */
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
					const root = String(body.path ?? "");
					const rel = String(body.rel ?? "");
					if (root === "") return writeJson(res, {
						ok: false,
						error: "missing-path"
					});
					if (rel !== "") {
						if (rel.split("/").some((s) => s === "" || s === "." || s === "..")) return writeJson(res, {
							ok: false,
							error: "bad-rel"
						});
					}
					const abs = rel === "" ? root : root.replace(/\/+$/, "") + "/" + rel;
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
					const path = String(body.path ?? "");
					if (path === "") return writeJson(res, {
						ok: false,
						error: "missing-path"
					});
					try {
						const size = (await stat(path)).size;
						if (size > cfg.peekMaxBytes) return writeJson(res, {
							ok: true,
							tooLarge: true,
							binary: false,
							size,
							lineCount: 0,
							content: "",
							truncatedLines: false
						});
						const text = (await readFile(path)).toString("utf-8");
						const binary = text.includes("\0");
						const lines = text.split("\n");
						return writeJson(res, {
							ok: true,
							tooLarge: false,
							binary,
							size,
							content: lines.slice(0, cfg.peekMaxLines).join("\n"),
							truncatedLines: lines.length > cfg.peekMaxLines,
							lineCount: lines.length
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
export { src_default as default };
