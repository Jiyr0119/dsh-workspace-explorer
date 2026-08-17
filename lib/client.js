window.__ModuleLoader__.load({
	id: "@jiyr0119/dsh-workspace-explorer",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region \0dsh-css:/Users/jonathan/workspaceforme/dsh-workspace-explorer/src/client/panel.module.css.mjs
		const css = "._54xtAa_dshwe-layer{z-index:100;pointer-events:none;position:fixed;inset:0}._54xtAa_dshwe-panel{pointer-events:auto;background:var(--dsw-alias-bg-layer-2,#262626);border:1px solid var(--dsw-alias-border-inverted,#80808047);width:384px;height:min(640px,100dvh - 110px);min-height:320px;box-shadow:var(--dsw-shadow-lv3,0 12px 32px #00000040);color:var(--dsw-alias-label-primary,#e8e8e8);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2,#80808066);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2,#80808099);border-radius:24px;flex-direction:column;font:13px/1.45 -apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Microsoft YaHei,sans-serif;display:flex;position:absolute;top:14px;bottom:auto;right:14px;overflow:hidden}._54xtAa_dshwe-head{border-bottom:1px solid var(--dsw-alias-border-l3,#80808033);flex:none;align-items:center;gap:8px;padding:14px 16px 12px 18px;display:flex}._54xtAa_dshwe-head-ico{color:var(--dsw-alias-state-business-primary,#4176e6);flex:none;display:inline-flex}._54xtAa_dshwe-title{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;font-size:15px;font-weight:600;overflow:hidden}._54xtAa_dshwe-icobtn{color:var(--dsw-alias-label-secondary,#9a9a9a);cursor:pointer;background:0 0;border:0;border-radius:8px;flex:none;justify-content:center;align-items:center;width:28px;height:28px;display:inline-flex}._54xtAa_dshwe-icobtn:hover{background:var(--dsw-alias-interactive-bg-hover,#80808024);color:var(--dsw-alias-label-primary,#e8e8e8)}._54xtAa_dshwe-selrow{align-items:center;gap:8px;padding:12px 16px 4px;display:flex}._54xtAa_dshwe-sel,._54xtAa_dshwe-filter{min-width:0;height:30px;color:var(--dsw-alias-label-primary,#e8e8e8);border:1px solid var(--dsw-alias-border-l2,#80808059);font:inherit;background:0 0;border-radius:8px;outline:none;flex:1;padding:0 8px;font-size:12.5px}._54xtAa_dshwe-sel:focus-visible,._54xtAa_dshwe-filter:focus-visible{border-color:var(--dsw-alias-state-business-primary,#4176e6)}._54xtAa_dshwe-filter::placeholder{color:var(--dsw-alias-label-caption,#8a8a8a)}._54xtAa_dshwe-filterrow{align-items:center;gap:6px;padding:0 16px 6px;display:flex}._54xtAa_dshwe-filter-clear{color:var(--dsw-alias-label-secondary,#9a9a9a);cursor:pointer;background:0 0;border:0;border-radius:6px;flex:none;justify-content:center;align-items:center;width:26px;height:26px;display:inline-flex}._54xtAa_dshwe-filter-clear:hover{color:var(--dsw-alias-label-primary,#e8e8e8);background:var(--dsw-alias-interactive-bg-hover,#8080801f)}._54xtAa_dshwe-addbtn{border:1px solid var(--dsw-alias-border-l2,#80808059);height:30px;color:var(--dsw-alias-label-secondary,#9a9a9a);font:inherit;cursor:pointer;background:0 0;border-radius:8px;flex:none;align-items:center;gap:3px;padding:0 10px;font-size:12.5px;display:inline-flex}._54xtAa_dshwe-addbtn:hover{color:var(--dsw-alias-label-primary,#e8e8e8);background:var(--dsw-alias-interactive-bg-hover,#8080801f)}._54xtAa_dshwe-hintline{color:var(--dsw-alias-label-caption,#8a8a8a);align-items:center;gap:6px;padding:0 18px 8px;font-size:11px;display:flex}._54xtAa_dshwe-tree{flex:1;padding:2px 6px 10px;overflow:auto}._54xtAa_dshwe-row{cursor:pointer;user-select:none;white-space:nowrap;text-align:left;width:100%;color:inherit;font:inherit;background:0 0;border:0;border-radius:10px;align-items:center;gap:7px;padding:4.5px 10px;display:flex}._54xtAa_dshwe-row:hover{background:var(--dsw-alias-interactive-bg-hover,#8080801f)}._54xtAa_dshwe-row-file{cursor:grab}._54xtAa_dshwe-row-file:active{cursor:grabbing}._54xtAa_dshwe-chev-slot{flex:none;justify-content:center;align-items:center;width:14px;display:inline-flex}._54xtAa_dshwe-chev{color:var(--dsw-alias-label-dimmed,#777);transition:transform .16s;display:inline-flex}._54xtAa_dshwe-chev-on{transform:rotate(90deg)}@media (prefers-reduced-motion:reduce){._54xtAa_dshwe-chev{transition:none}}._54xtAa_dshwe-ico{flex:none;justify-content:center;align-items:center;display:inline-flex}._54xtAa_dshwe-folder-svg{color:#dcb67a}._54xtAa_dshwe-name{text-overflow:ellipsis;flex:1;min-width:0;font-size:12.5px;overflow:hidden}._54xtAa_dshwe-row-dir ._54xtAa_dshwe-name{font-weight:600}._54xtAa_dshwe-size{color:var(--dsw-alias-label-caption,#8a8a8a);font-variant-numeric:tabular-nums;flex:none;padding-left:6px;font-size:11px}._54xtAa_dshwe-eye,._54xtAa_dshwe-insert{opacity:0;color:var(--dsw-alias-label-secondary,#9a9a9a);cursor:pointer;flex:none;justify-content:center;align-items:center;transition:opacity .12s;display:inline-flex}._54xtAa_dshwe-eye:hover,._54xtAa_dshwe-insert{color:var(--dsw-alias-state-business-primary,#4176e6)}._54xtAa_dshwe-row:hover ._54xtAa_dshwe-eye,._54xtAa_dshwe-row:hover ._54xtAa_dshwe-insert,._54xtAa_dshwe-row:focus-visible ._54xtAa_dshwe-insert{opacity:1}._54xtAa_dshwe-note{color:var(--dsw-alias-label-caption,#8a8a8a);align-items:center;gap:8px;padding:6px 16px;font-size:12px;display:flex}._54xtAa_dshwe-note-err{color:var(--dsw-alias-state-error-primary,#e5484d)}._54xtAa_dshwe-spin{border:2px solid var(--dsw-alias-border-l2,#80808066);border-top-color:var(--dsw-alias-state-business-primary,#4176e6);border-radius:50%;flex:none;width:13px;height:13px;animation:.7s linear infinite _54xtAa_dshwe-spin}@keyframes _54xtAa_dshwe-spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){._54xtAa_dshwe-spin{animation-duration:1.6s}}._54xtAa_dshwe-empty{color:var(--dsw-alias-label-secondary,#9a9a9a);flex-direction:column;align-items:flex-start;gap:12px;padding:20px 18px;font-size:12.5px;display:flex}._54xtAa_dshwe-empty-ico{color:var(--dsw-alias-label-dimmed,#777);opacity:.8}._54xtAa_dshwe-preview{border-top:1px solid var(--dsw-alias-border-l3,#80808033);background:var(--dsw-alias-bg-layer-1,#222);flex-direction:column;flex:none;max-height:46%;display:flex}._54xtAa_dshwe-preview-head{align-items:center;gap:8px;padding:10px 14px 6px;display:flex}._54xtAa_dshwe-preview-name{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;font-size:12.5px;font-weight:600;overflow:hidden}._54xtAa_dshwe-preview-meta{color:var(--dsw-alias-label-caption,#8a8a8a);flex:none;font-size:11px}._54xtAa_dshwe-preview-pre{color:var(--dsw-alias-label-primary,#e8e8e8);white-space:pre;flex:1;margin:0;padding:4px 14px 10px;font:11.5px/1.6 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;overflow:auto}._54xtAa_dshwe-preview-actions{align-items:center;gap:8px;padding:0 14px 10px;display:flex}._54xtAa_dshwe-prevbtn{border:1px solid var(--dsw-alias-border-l2,#80808059);color:var(--dsw-alias-label-secondary,#9a9a9a);font:inherit;cursor:pointer;background:0 0;border-radius:8px;flex:none;padding:4px 10px;font-size:12px}._54xtAa_dshwe-prevbtn:hover{color:var(--dsw-alias-label-primary,#e8e8e8);background:var(--dsw-alias-interactive-bg-hover,#8080801f)}._54xtAa_dshwe-prevbtn-primary{color:#fff;background:var(--dsw-alias-state-business-primary,#4176e6);border-color:#0000}._54xtAa_dshwe-prevbtn-primary:hover{opacity:.9}._54xtAa_dshwe-prevbtn:disabled{opacity:.45;cursor:not-allowed}._54xtAa_dshwe-hint{border:1.5px dashed var(--dsw-alias-state-business-primary,#4176e6);pointer-events:none;border-radius:20px;justify-content:center;align-items:center;display:flex;position:absolute;inset:10px}._54xtAa_dshwe-hint-chip{background:var(--dsw-alias-bg-layer-2,#262626);color:var(--dsw-alias-label-primary,#e8e8e8);box-shadow:var(--dsw-shadow-lv2,0 4px 12px #00000040);border-radius:999px;align-items:center;gap:7px;padding:9px 15px;font-size:13px;display:flex}._54xtAa_dshwe-hint-chip svg{color:var(--dsw-alias-state-business-primary,#4176e6)}._54xtAa_dshwe-act{color:var(--dsw-alias-label-secondary,#9a9a9a);cursor:pointer;font:inherit;background:0 0;border:0;border-radius:8px;align-items:center;gap:6px;padding:5px 8px;display:inline-flex}._54xtAa_dshwe-act:hover{background:var(--dsw-alias-interactive-bg-hover,#8080801f);color:var(--dsw-alias-label-primary,#e8e8e8)}._54xtAa_dshwe-act-on{color:var(--dsw-alias-state-business-primary,#4176e6)}._54xtAa_dshwe-row:focus-visible,._54xtAa_dshwe-icobtn:focus-visible,._54xtAa_dshwe-act:focus-visible,._54xtAa_dshwe-addbtn:focus-visible,._54xtAa_dshwe-prevbtn:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#4176e6);outline-offset:-2px}";
		const tagId = "@jiyr0119/dsh-workspace-explorer/panel.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@jiyr0119/dsh-workspace-explorer";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var panel_module_css_default = {
			"dshwe-filter": "_54xtAa_dshwe-filter",
			"dshwe-icobtn": "_54xtAa_dshwe-icobtn",
			"dshwe-hintline": "_54xtAa_dshwe-hintline",
			"dshwe-selrow": "_54xtAa_dshwe-selrow",
			"dshwe-chev-slot": "_54xtAa_dshwe-chev-slot",
			"dshwe-insert": "_54xtAa_dshwe-insert",
			"dshwe-sel": "_54xtAa_dshwe-sel",
			"dshwe-filterrow": "_54xtAa_dshwe-filterrow",
			"dshwe-head-ico": "_54xtAa_dshwe-head-ico",
			"dshwe-prevbtn": "_54xtAa_dshwe-prevbtn",
			"dshwe-head": "_54xtAa_dshwe-head",
			"dshwe-preview-meta": "_54xtAa_dshwe-preview-meta",
			"dshwe-hint": "_54xtAa_dshwe-hint",
			"dshwe-act": "_54xtAa_dshwe-act",
			"dshwe-ico": "_54xtAa_dshwe-ico",
			"dshwe-note-err": "_54xtAa_dshwe-note-err",
			"dshwe-eye": "_54xtAa_dshwe-eye",
			"dshwe-spin": "_54xtAa_dshwe-spin",
			"dshwe-empty-ico": "_54xtAa_dshwe-empty-ico",
			"dshwe-panel": "_54xtAa_dshwe-panel",
			"dshwe-tree": "_54xtAa_dshwe-tree",
			"dshwe-filter-clear": "_54xtAa_dshwe-filter-clear",
			"dshwe-folder-svg": "_54xtAa_dshwe-folder-svg",
			"dshwe-name": "_54xtAa_dshwe-name",
			"dshwe-note": "_54xtAa_dshwe-note",
			"dshwe-chev": "_54xtAa_dshwe-chev",
			"dshwe-empty": "_54xtAa_dshwe-empty",
			"dshwe-preview-name": "_54xtAa_dshwe-preview-name",
			"dshwe-preview-pre": "_54xtAa_dshwe-preview-pre",
			"dshwe-row-dir": "_54xtAa_dshwe-row-dir",
			"dshwe-layer": "_54xtAa_dshwe-layer",
			"dshwe-preview": "_54xtAa_dshwe-preview",
			"dshwe-preview-head": "_54xtAa_dshwe-preview-head",
			"dshwe-row": "_54xtAa_dshwe-row",
			"dshwe-preview-actions": "_54xtAa_dshwe-preview-actions",
			"dshwe-prevbtn-primary": "_54xtAa_dshwe-prevbtn-primary",
			"dshwe-addbtn": "_54xtAa_dshwe-addbtn",
			"dshwe-title": "_54xtAa_dshwe-title",
			"dshwe-row-file": "_54xtAa_dshwe-row-file",
			"dshwe-chev-on": "_54xtAa_dshwe-chev-on",
			"dshwe-size": "_54xtAa_dshwe-size",
			"dshwe-hint-chip": "_54xtAa_dshwe-hint-chip",
			"dshwe-act-on": "_54xtAa_dshwe-act-on"
		};
		//#endregion
		//#region src/client/index.tsx
		/**
		* dsh-workspace-explorer — Client 半区(原生包)
		*
		* 浏览器 bundle(src/client/index.tsx → lib/client.js,__ModuleLoader__ 格式)。
		* 通过 /dsh-we/api/* JSON 路由调用 Host;注册 shell.overlay / sidebar.footer.action /
		* conversation.input.dock 三个槽位,与动态版功能一致(树/搜索/预览/i18n/拖拽)。
		*/
		const MARKER = "application/x-dsh-ws-file";
		const C = (k) => panel_module_css_default[k] ?? k;
		async function api(method, payload) {
			return (await fetch(`/dsh-we/api/${method}`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(payload)
			})).json();
		}
		const NS = "dsh-workspace-explorer";
		const DICTS = {
			zh: {
				"panel.title": "工作区文件",
				"ws.current": "当前目录",
				"search.ph": "搜索文件(仅已加载目录)…",
				hint: "点击文件或拖拽到输入框,发送给模型",
				"empty.title": "还没有可浏览的工作区。选择一个项目文件夹,即可在这里查看目录文件。",
				"empty.add": "+ 选择文件夹作为工作区",
				"loading.ws": "正在加载工作区…",
				hit: "匹配 {n} 项",
				"hit.none": "没有匹配「{q}」的文件(搜索范围:已加载目录)",
				truncated: "已截断,仅显示前 {n} 项",
				loading: "加载中…",
				"load.fail": "加载失败: ",
				read: "读取中…",
				"read.fail": "读取失败: ",
				"too.large": "文件过大({s}),仅支持插入引用",
				binary: "二进制文件,仅支持插入引用",
				"lines.tail": "…(共 {n} 行,仅显示前 60 行)",
				"btn.ref": "插入引用",
				"btn.content": "插入内容",
				"btn.content.tip": "把文件内容插入输入框",
				"btn.content.no": "文件过大或二进制,无法内联",
				"sidebar.tooltip": "工作区文件",
				"sidebar.label": "文件",
				refresh: "刷新",
				close: "关闭",
				"close.preview": "关闭预览",
				"row.tip": "点击或拖拽到输入框",
				"preview.tip": "预览 (P)",
				"insert.tip": "插入引用",
				"drop.hint": "松开以插入文件引用到输入框",
				"add.ws": "添加工作区"
			},
			en: {
				"panel.title": "Workspace Files",
				"ws.current": "Current dir",
				"search.ph": "Search files (loaded dirs only)…",
				hint: "Click a file or drag it into the composer to send",
				"empty.title": "No browsable workspace yet. Pick a project folder to view its files.",
				"empty.add": "+ Choose a folder as workspace",
				"loading.ws": "Loading workspaces…",
				hit: "{n} match(es)",
				"hit.none": "No files match \"{q}\" (search covers loaded dirs)",
				truncated: "Truncated: showing the first {n}",
				loading: "Loading…",
				"load.fail": "Load failed: ",
				read: "Reading…",
				"read.fail": "Read failed: ",
				"too.large": "File too large ({s}); reference only",
				binary: "Binary file; reference only",
				"lines.tail": "…({n} lines total, showing the first 60)",
				"btn.ref": "Insert reference",
				"btn.content": "Insert content",
				"btn.content.tip": "Insert the file content into the composer",
				"btn.content.no": "Too large or binary — cannot inline",
				"sidebar.tooltip": "Workspace Files",
				"sidebar.label": "Files",
				refresh: "Refresh",
				close: "Close",
				"close.preview": "Close preview",
				"row.tip": "click or drag to the composer",
				"preview.tip": "Preview (P)",
				"insert.tip": "Insert reference",
				"drop.hint": "Release to insert the file reference into the composer",
				"add.ws": "Add workspace"
			}
		};
		const FOLDER_D = "M1.5 2.5A1.5 1.5 0 0 1 3 1h3.2l1.6 2H13a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 13 13H3a1.5 1.5 0 0 1-1.5-1.5v-9z";
		const DOC_BODY = "M4.3 1.7h5.3l2.7 2.7v8.9a1 1 0 0 1-1 1H4.3a1 1 0 0 1-1-1V2.7a1 1 0 0 1 1-1z";
		const DOC_FOLD = "M9.6 1.7L12.3 4.4H9.6z";
		const GLYPHS = {
			code: "M6.4 6.1L4.9 8l1.5 1.9M9.6 6.1l1.5 1.9L9.6 9.9",
			image: "M3.6 12.4l2.7-2.7 1.8 1.8 1.5-1.5 2.8 2.4M5.4 6.4a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2z",
			markdown: "M5.1 11.2l1.9-2.9 1.9 2.9M5.1 8.4h3.8",
			config: "M3.2 5.6h3.6M9 5.6h3.8M3.2 10.4h3.6M9 10.4h3.8M7.4 3.8v3.6M7.4 8.6v3.6",
			css: "M6.2 4.4v7.2M9.8 4.4v7.2M4.9 6.9h6.2M4.9 9.1h6.2",
			shell: "M3.6 5.4l2.4 2.6L3.6 10.6M8.1 10.6h4.3",
			plain: ""
		};
		const FILE_META = {
			ts: ["#3178c6", "code"],
			tsx: ["#3178c6", "code"],
			mts: ["#3178c6", "code"],
			cts: ["#3178c6", "code"],
			js: ["#d4a72c", "code"],
			jsx: ["#d4a72c", "code"],
			mjs: ["#d4a72c", "code"],
			cjs: ["#d4a72c", "code"],
			py: ["#3572a5", "code"],
			pyi: ["#3572a5", "code"],
			rs: ["#e0a15e", "code"],
			go: ["#00add8", "code"],
			java: ["#b07219", "code"],
			rb: ["#cc342d", "code"],
			php: ["#777bb4", "code"],
			swift: ["#f05138", "code"],
			kt: ["#7f52ff", "code"],
			sh: ["#4c9a4a", "shell"],
			bash: ["#4c9a4a", "shell"],
			zsh: ["#4c9a4a", "shell"],
			json: ["#c9a227", "config"],
			yml: ["#5b7c99", "config"],
			yaml: ["#5b7c99", "config"],
			toml: ["#5b7c99", "config"],
			ini: ["#5b7c99", "config"],
			env: ["#5b7c99", "config"],
			cfg: ["#5b7c99", "config"],
			conf: ["#5b7c99", "config"],
			md: ["#4f8ac9", "markdown"],
			mdx: ["#4f8ac9", "markdown"],
			txt: ["#8a919c", "plain"],
			rst: ["#4f8ac9", "markdown"],
			css: ["#2965f1", "css"],
			scss: ["#c6538c", "css"],
			less: ["#1d70b8", "css"],
			html: ["#e34c26", "code"],
			htm: ["#e34c26", "code"],
			xml: ["#e34c26", "code"],
			svg: ["#5a67d8", "image"],
			png: ["#5a67d8", "image"],
			jpg: ["#5a67d8", "image"],
			jpeg: ["#5a67d8", "image"],
			gif: ["#5a67d8", "image"],
			webp: ["#5a67d8", "image"],
			ico: ["#5a67d8", "image"],
			avif: ["#5a67d8", "image"],
			sql: ["#c98a1b", "config"]
		};
		const DEFAULT_META = ["#8a919c", "plain"];
		const fmtSize = (n) => {
			if (n == null) return "";
			if (n < 1024) return `${n} B`;
			if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
			return `${(n / 1048576).toFixed(1)} MB`;
		};
		const basename = (p) => {
			const s = p.replace(/\/+$/, "");
			const i = s.lastIndexOf("/");
			return i >= 0 ? s.slice(i + 1) : s;
		};
		const extOf = (name) => {
			const i = name.lastIndexOf(".");
			return i <= 0 ? "" : name.slice(i + 1).toLowerCase();
		};
		function FolderSvg({ open }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				viewBox: "0 0 16 16",
				width: 16,
				height: 16,
				className: C("dshwe-ico dshwe-folder-svg"),
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: FOLDER_D,
					fill: open ? "#e8c47c" : "#dcb67a"
				})
			});
		}
		function FileSvg({ color, glyph }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 16 16",
				width: 16,
				height: 16,
				className: C("dshwe-ico"),
				"aria-hidden": "true",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						d: DOC_BODY,
						fill: color
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						d: DOC_FOLD,
						fill: "rgba(255,255,255,.92)"
					}),
					glyph !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						d: glyph,
						fill: "none",
						stroke: "#fff",
						strokeWidth: 1.5,
						strokeLinecap: "round",
						strokeLinejoin: "round"
					}) : null
				]
			});
		}
		function ChevronSvg({ open }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				viewBox: "0 0 16 16",
				width: 14,
				height: 14,
				className: C("dshwe-chev") + (open ? ` ${C("dshwe-chev-on")}` : ""),
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M6 4l4 4-4 4",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: 1.5,
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			});
		}
		function iconFor(entry, open) {
			if (entry.type === "directory") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FolderSvg, { open });
			const meta = FILE_META[extOf(entry.name)] ?? DEFAULT_META;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileSvg, {
				color: meta[0],
				glyph: GLYPHS[meta[1]] ?? ""
			});
		}
		const openListeners = /* @__PURE__ */ new Set();
		let open = false;
		const getOpen = () => open;
		const setOpen = (v) => {
			open = v;
			openListeners.forEach((fn) => fn(open));
		};
		const subscribeOpen = (fn) => {
			openListeners.add(fn);
			return () => {
				openListeners.delete(fn);
			};
		};
		let bridge = null;
		const setBridge = (b) => {
			bridge = b;
		};
		const getBridge = () => bridge;
		function SidebarAction(props) {
			const [on, setOnState] = (0, react.useState)(getOpen());
			(0, react.useEffect)(() => subscribeOpen(setOnState), []);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: C("dshwe-act") + (on ? ` ${C("dshwe-act-on")}` : ""),
				onClick: () => setOpen(!getOpen()),
				title: tr("sidebar.tooltip"),
				"aria-label": tr("sidebar.tooltip"),
				"aria-pressed": on,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
					viewBox: "0 0 16 16",
					width: 16,
					height: 16,
					"aria-hidden": "true",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						d: FOLDER_D,
						fill: "currentColor"
					})
				}), props.wide === true ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("sidebar.label") }) : null]
			});
		}
		function DockBridge(props) {
			const input = props.useInput ? props.useInput((s) => s) : void 0;
			const actions = props.inputActions;
			const draftRef = (0, react.useRef)(input?.draft ?? "");
			draftRef.current = input?.draft ?? "";
			(0, react.useEffect)(() => {
				if (!actions) return;
				setBridge({ insert(text) {
					const draft = draftRef.current;
					const sep = draft === "" || draft.endsWith("\n") ? "" : "\n";
					actions.setDraft(draft + sep + text);
				} });
			}, [actions]);
			return null;
		}
		function Panel(props) {
			const wsState = props.useWorkspaces((s) => s);
			const sessions = props.useSessions((s) => s);
			const workspaces = wsState.items ?? [];
			const cwd = (sessions.current && sessions.byId ? sessions.byId[sessions.current] : void 0)?.cwd;
			const [root, setRoot] = (0, react.useState)(null);
			const [dirs, setDirs] = (0, react.useState)({});
			const [expanded, setExpanded] = (0, react.useState)({});
			const [filter, setFilter] = (0, react.useState)("");
			const [preview, setPreview] = (0, react.useState)(null);
			const recentItem = workspaces.find((w) => w.workspaceId === wsState.recentWorkspaceId);
			const firstItem = workspaces[0];
			(0, react.useEffect)(() => {
				if (root !== null) return;
				const cand = cwd ?? recentItem?.path ?? firstItem?.path;
				if (cand) setRoot(cand);
			}, [
				root,
				cwd,
				wsState.state,
				recentItem,
				firstItem
			]);
			const loadDir = (0, react.useCallback)(async (r, rel) => {
				setDirs((d) => ({
					...d,
					[rel]: {
						loading: true,
						error: null,
						entries: d[rel]?.entries ?? [],
						truncated: false
					}
				}));
				try {
					const res = await api("list", {
						path: r,
						rel
					});
					if (!res.ok) throw new Error(res.error ?? "unknown");
					setDirs((d) => ({
						...d,
						[rel]: {
							loading: false,
							error: null,
							entries: res.entries ?? [],
							truncated: res.truncated === true
						}
					}));
				} catch (err) {
					setDirs((d) => ({
						...d,
						[rel]: {
							loading: false,
							error: String(err?.message ?? err),
							entries: [],
							truncated: false
						}
					}));
				}
			}, []);
			(0, react.useEffect)(() => {
				if (root === null) return;
				setDirs({});
				setExpanded({});
				setPreview(null);
				loadDir(root, "");
			}, [root, loadDir]);
			const toggle = (rel) => {
				const willExpand = !expanded[rel];
				setExpanded((e) => {
					const n = { ...e };
					if (willExpand) n[rel] = true;
					else delete n[rel];
					return n;
				});
				if (willExpand && root) loadDir(root, rel);
			};
			const refresh = () => {
				if (root === null) return;
				loadDir(root, "");
				Object.keys(expanded).forEach((rel) => {
					if (rel !== "") loadDir(root, rel);
				});
			};
			const markerFor = (entry) => root === cwd ? `[file: ${entry.rel}]` : `[file: ${entry.path}]`;
			const insertMarker = (entry) => {
				const b = getBridge();
				if (b) b.insert(markerFor(entry));
			};
			const openPreview = async (entry) => {
				setPreview({
					entry,
					loading: true,
					data: null,
					error: null
				});
				try {
					const res = await api("peek", { path: entry.path });
					if (!res.ok) throw new Error(res.error ?? "unknown");
					setPreview({
						entry,
						loading: false,
						data: res,
						error: null
					});
				} catch (err) {
					setPreview({
						entry,
						loading: false,
						data: null,
						error: String(err?.message ?? err)
					});
				}
			};
			const insertContent = () => {
				if (!preview?.data || preview.data.tooLarge || preview.data.binary || (preview.data.size ?? 0) > 32768) return;
				const b = getBridge();
				if (b) b.insert(`\n${preview.data.content ?? ""}\n`);
			};
			const onDragStart = (ev, entry) => {
				ev.dataTransfer.setData("text/plain", markerFor(entry));
				ev.dataTransfer.setData(MARKER, JSON.stringify({
					path: entry.path,
					rel: entry.rel,
					name: entry.name
				}));
				ev.dataTransfer.effectAllowed = "copy";
				props.onDraggingChange(true);
			};
			const q = filter.trim().toLowerCase();
			const collectMatches = (rel, out) => {
				const data = dirs[rel];
				if (!data) return;
				for (const entry of data.entries) {
					if (entry.name.toLowerCase().includes(q)) out.push({ entry });
					if (entry.type === "directory") collectMatches(entry.rel, out);
				}
			};
			const rowFor = (entry, depth, isExp) => {
				const isDir = entry.type === "directory";
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: C("dshwe-row") + (isDir ? ` ${C("dshwe-row-dir")}` : ` ${C("dshwe-row-file")}`),
					style: { paddingLeft: 10 + depth * 16 },
					title: entry.path + (isDir ? "" : ` · ${tr("row.tip")}`),
					draggable: !isDir,
					onDragStart: isDir ? void 0 : (ev) => onDragStart(ev, entry),
					onClick: () => {
						if (isDir) toggle(entry.rel);
						else insertMarker(entry);
					},
					onKeyDown: (ev) => {
						if (ev.key === "Enter" || ev.key === " ") {
							ev.preventDefault();
							if (isDir) toggle(entry.rel);
							else insertMarker(entry);
						} else if (ev.key === "p" && !isDir) {
							ev.preventDefault();
							openPreview(entry);
						}
					},
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: C("dshwe-chev-slot"),
							children: isDir ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChevronSvg, { open: isExp }) : null
						}),
						iconFor(entry, isExp),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: C("dshwe-name"),
							children: entry.name
						}),
						!isDir && entry.size != null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: C("dshwe-size"),
							children: fmtSize(entry.size)
						}) : null,
						!isDir ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: C("dshwe-eye"),
							title: tr("preview.tip"),
							role: "button",
							onMouseDown: (e) => {
								e.preventDefault();
								e.stopPropagation();
								openPreview(entry);
							},
							onClick: (e) => e.stopPropagation(),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
								viewBox: "0 0 16 16",
								width: 13,
								height: 13,
								"aria-hidden": "true",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
									d: "M1.5 8s2.6-4.5 6.5-4.5S14.5 8 14.5 8 11.9 12.5 8 12.5 1.5 8 1.5 8zM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: 1.3,
									strokeLinejoin: "round"
								})
							})
						}) : null,
						!isDir ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: C("dshwe-insert"),
							title: tr("insert.tip"),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
								viewBox: "0 0 16 16",
								width: 13,
								height: 13,
								"aria-hidden": "true",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
									d: "M8 2.5v7.5M5.7 7.5L8 9.8l2.3-2.3M3.5 12.5h9",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: 1.4,
									strokeLinecap: "round",
									strokeLinejoin: "round"
								})
							})
						}) : null
					]
				}, entry.rel);
			};
			const renderTree = (rel, depth) => {
				const data = dirs[rel];
				if (!data) return [];
				const rows = [];
				for (const entry of data.entries) {
					const isExp = entry.type === "directory" && !!expanded[entry.rel];
					rows.push(rowFor(entry, depth, isExp));
					if (isExp) rows.push(...renderTree(entry.rel, depth + 1));
				}
				if (data.truncated) rows.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: C("dshwe-note"),
					children: tr("truncated", { n: data.entries.length })
				}, "trunc"));
				if (data.loading) rows.push(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: C("dshwe-note"),
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: C("dshwe-spin") }), tr("loading")]
				}, "load"));
				if (data.error) rows.push(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: C("dshwe-note dshwe-note-err"),
					children: [tr("load.fail"), data.error]
				}, "err"));
				return rows;
			};
			const addWorkspace = async () => {};
			let body;
			if (q !== "") {
				const hits = [];
				collectMatches("", hits);
				body = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: C("dshwe-note"),
					children: tr("hit", { n: hits.length })
				}), hits.length ? hits.map((h) => rowFor(h.entry, 0, false)) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: C("dshwe-empty"),
					children: tr("hit.none", { q: filter })
				})] });
			} else if (root === null) body = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: C("dshwe-empty"),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: C("dshwe-empty-ico"),
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
						viewBox: "0 0 16 16",
						width: 17,
						height: 17,
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							d: FOLDER_D,
							fill: "currentColor"
						})
					})
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: tr("empty.title") })]
			});
			else body = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: renderTree("", 0) });
			const options = [];
			if (cwd) options.push({
				value: cwd,
				label: `${tr("ws.current")} · ${basename(cwd)}`
			});
			for (const w of workspaces) options.push({
				value: w.path,
				label: `${w.title} · ${w.path}`
			});
			const seen = /* @__PURE__ */ new Set();
			const uniqOptions = options.filter((o) => seen.has(o.value) ? false : (seen.add(o.value), true));
			const rootLabel = root ? basename(root) : "";
			let pv = null;
			if (preview) {
				const d = preview.data;
				let contentArea;
				if (preview.loading) contentArea = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: C("dshwe-note"),
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: C("dshwe-spin") }), tr("read")]
				});
				else if (preview.error) contentArea = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: C("dshwe-note dshwe-note-err"),
					children: [tr("read.fail"), preview.error]
				});
				else if (d?.tooLarge) contentArea = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: C("dshwe-note"),
					children: tr("too.large", { s: fmtSize(d.size) })
				});
				else if (d?.binary) contentArea = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: C("dshwe-note"),
					children: tr("binary")
				});
				else contentArea = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("pre", {
					className: C("dshwe-preview-pre"),
					children: [d?.content, d?.truncatedLines ? `\n${tr("lines.tail", { n: d.lineCount ?? 0 })}` : ""]
				});
				const canInline = !preview.loading && !preview.error && !!d && !d.tooLarge && !d.binary && (d.size ?? 0) <= 32768;
				pv = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: C("dshwe-preview"),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: C("dshwe-preview-head"),
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: C("dshwe-preview-name"),
									children: preview.entry.name
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: C("dshwe-preview-meta"),
									children: preview.entry.size != null ? fmtSize(preview.entry.size) : ""
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: C("dshwe-icobtn"),
									onClick: () => setPreview(null),
									title: tr("close.preview"),
									"aria-label": tr("close.preview"),
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
										viewBox: "0 0 16 16",
										width: 13,
										height: 13,
										"aria-hidden": "true",
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
											d: "M4 4l8 8M12 4l-8 8",
											fill: "none",
											stroke: "currentColor",
											strokeWidth: 1.5,
											strokeLinecap: "round"
										})
									})
								})
							]
						}),
						contentArea,
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: C("dshwe-preview-actions"),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: C("dshwe-prevbtn"),
								onClick: () => insertMarker(preview.entry),
								children: tr("btn.ref")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: C("dshwe-prevbtn dshwe-prevbtn-primary"),
								disabled: !canInline,
								title: canInline ? tr("btn.content.tip") : tr("btn.content.no"),
								onClick: insertContent,
								children: tr("btn.content")
							})]
						})
					]
				});
			}
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: C("dshwe-panel"),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: C("dshwe-head"),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: C("dshwe-head-ico"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
									viewBox: "0 0 16 16",
									width: 17,
									height: 17,
									"aria-hidden": "true",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
										d: FOLDER_D,
										fill: "currentColor"
									})
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: C("dshwe-title"),
								children: [tr("panel.title"), rootLabel ? ` · ${rootLabel}` : ""]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: C("dshwe-icobtn"),
								onClick: refresh,
								title: tr("refresh"),
								"aria-label": tr("refresh"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
									viewBox: "0 0 16 16",
									width: 14,
									height: 14,
									"aria-hidden": "true",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
										d: "M13.5 8a5.5 5.5 0 1 1-1.61-3.89M13.5 1.5v3h-3",
										fill: "none",
										stroke: "currentColor",
										strokeWidth: 1.5,
										strokeLinecap: "round"
									})
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: C("dshwe-icobtn"),
								onClick: () => setOpen(false),
								title: tr("close"),
								"aria-label": tr("close"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
									viewBox: "0 0 16 16",
									width: 14,
									height: 14,
									"aria-hidden": "true",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
										d: "M4 4l8 8M12 4l-8 8",
										fill: "none",
										stroke: "currentColor",
										strokeWidth: 1.5,
										strokeLinecap: "round"
									})
								})
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: C("dshwe-selrow"),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
							className: C("dshwe-sel"),
							value: root ?? "",
							onChange: (e) => setRoot(e.target.value),
							children: uniqOptions.map((o) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: o.value,
								children: o.label
							}, o.value))
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: C("dshwe-addbtn"),
							onClick: () => void addWorkspace(),
							title: tr("add.ws"),
							children: "+"
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: C("dshwe-filterrow"),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: C("dshwe-filter"),
							type: "text",
							value: filter,
							placeholder: tr("search.ph"),
							onChange: (e) => setFilter(e.target.value)
						}), filter !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: C("dshwe-filter-clear"),
							onClick: () => setFilter(""),
							title: tr("close"),
							"aria-label": tr("close"),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
								viewBox: "0 0 16 16",
								width: 12,
								height: 12,
								"aria-hidden": "true",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
									d: "M4 4l8 8M12 4l-8 8",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: 1.5,
									strokeLinecap: "round"
								})
							})
						}) : null]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: C("dshwe-hintline"),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "↩" }), tr("hint")]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: C("dshwe-tree"),
						children: body
					}),
					pv
				]
			});
		}
		function OverlayEntry(props) {
			const [on, setOnState] = (0, react.useState)(getOpen());
			const [dragging, setDragging] = (0, react.useState)(false);
			(0, react.useEffect)(() => subscribeOpen(setOnState), []);
			(0, react.useEffect)(() => {
				const hasMarker = (e) => !!e.dataTransfer && Array.from(e.dataTransfer.types ?? []).includes(MARKER);
				const onDragOver = (e) => {
					if (!hasMarker(e)) return;
					e.preventDefault();
					if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
				};
				const onDrop = (e) => {
					if (!hasMarker(e)) return;
					const markerText = e.dataTransfer?.getData("text/plain") ?? "";
					const target = e.target instanceof HTMLElement ? e.target : null;
					if ((target ? target.closest("[data-composer-card] textarea") : null) != null) {
						setDragging(false);
						return;
					}
					e.preventDefault();
					e.stopPropagation();
					setDragging(false);
					if (markerText !== "") {
						const b = getBridge();
						if (b) b.insert(markerText);
					}
				};
				const onDragEnd = () => setDragging(false);
				document.addEventListener("dragover", onDragOver, true);
				document.addEventListener("drop", onDrop, true);
				document.addEventListener("dragend", onDragEnd);
				return () => {
					document.removeEventListener("dragover", onDragOver, true);
					document.removeEventListener("drop", onDrop, true);
					document.removeEventListener("dragend", onDragEnd);
				};
			}, []);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: C("dshwe-layer"),
				children: [dragging ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: C("dshwe-hint"),
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: C("dshwe-hint-chip"),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
							viewBox: "0 0 16 16",
							width: 16,
							height: 16,
							"aria-hidden": "true",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
								d: "M8 3.5v6M5.7 7.2L8 9.5l2.3-2.3M3.5 12.5h9",
								fill: "none",
								stroke: "currentColor",
								strokeWidth: 1.5,
								strokeLinecap: "round",
								strokeLinejoin: "round"
							})
						}), tr("drop.hint")]
					})
				}) : null, on ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Panel, {
					...props,
					onDraggingChange: setDragging
				}) : null]
			});
		}
		let tr = (k, vars) => {
			let s = DICTS.zh[k] ?? k;
			if (vars) for (const key in vars) s = s.split(`{${key}}`).join(String(vars[key]));
			return s;
		};
		const inject = ["slots", "locale"];
		function apply(ctx) {
			const slots = ctx.get("slots");
			if (slots === void 0) return;
			const locale = ctx.get("locale");
			if (locale !== void 0) try {
				ctx.effect(() => {
					const d1 = locale.register(NS, "zh", DICTS.zh);
					const d2 = locale.register(NS, "en", DICTS.en);
					return () => {
						d1();
						d2();
					};
				});
				const t = locale.bind(NS);
				tr = (k, vars) => {
					let s = t(k);
					if (typeof s !== "string" || s === k) s = DICTS.zh[k] ?? k;
					if (vars) for (const key in vars) s = s.split(`{${key}}`).join(String(vars[key]));
					return s;
				};
			} catch (err) {
				console.warn("locale init failed, fallback zh", String(err));
			}
			slots.inject("sidebar.footer.action", () => slots.register({
				name: "sidebar.footer.action",
				id: "workspace-explorer"
			}, (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SidebarAction, { ...props })));
			slots.inject("shell.overlay", () => slots.register({
				name: "shell.overlay",
				id: "workspace-explorer-panel"
			}, (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(OverlayEntry, { ...props })));
			slots.inject("conversation.input.dock", () => slots.register({
				name: "conversation.input.dock",
				id: "workspace-explorer-bridge"
			}, (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DockBridge, { ...props })));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
