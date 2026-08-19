window.__ModuleLoader__.load({
	id: "@jiyr0119/dsh-workspace-explorer",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region \0dsh-css:/Users/jonathan/workspaceforme/dsh-workspace-explorer/src/client/panel.module.css.mjs
		const css = "._54xtAa_dshwe-layer{z-index:100;pointer-events:none;position:fixed;inset:0}._54xtAa_dshwe-popup{background:var(--dsw-alias-bg-layer-2,#262626);border:1px solid var(--dsw-alias-border-inverted,#80808047);width:384px;box-shadow:var(--dsw-shadow-lv3,0 12px 32px #00000059);color:var(--dsw-alias-label-primary,#e8e8e8);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2,#80808066);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2,#80808099);pointer-events:auto;opacity:0;transform-origin:100% 0;border-radius:16px;flex-direction:column;font:13px/1.45 -apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Microsoft YaHei,sans-serif;transition:opacity .18s,transform .18s;display:flex;position:fixed;right:16px;overflow:hidden;transform:translateY(-8px)scale(.98)}._54xtAa_dshwe-popup-on{opacity:1;transform:translateY(0)scale(1)}@media (prefers-reduced-motion:reduce){._54xtAa_dshwe-popup{transition:none}}._54xtAa_dshwe-popup ._54xtAa_dshwe-panel{width:auto;height:auto;min-height:0;box-shadow:none;pointer-events:auto;border:0;border-radius:0;flex:1;position:static;top:auto;bottom:auto;right:auto}._54xtAa_dshwe-hicon{border:1px solid var(--dsw-alias-border-l2,#80808059);height:32px;color:var(--dsw-alias-label-primary,#e8e8e8);cursor:pointer;background:0 0;border-radius:18px;flex:none;justify-content:center;align-items:center;gap:4px;padding:6px 12px;font-size:13px;font-weight:400;line-height:20px;display:inline-flex}._54xtAa_dshwe-hicon span,._54xtAa_dshwe-hicon svg{flex:none}._54xtAa_dshwe-hicon span{white-space:nowrap}._54xtAa_dshwe-hicon:hover{background:var(--dsw-alias-interactive-bg-hover,#8080801f)}._54xtAa_dshwe-hicon-on{color:var(--dsw-alias-state-business-primary,#4176e6);border-color:#4176e680}._54xtAa_dshwe-panel{pointer-events:auto;background:var(--dsw-alias-bg-layer-2,#262626);border:0;border-left:1px solid var(--dsw-alias-border-inverted,#80808047);width:384px;height:calc(100dvh - 96px);min-height:320px;box-shadow:var(--dsw-shadow-lv3,0 12px 32px #00000040);color:var(--dsw-alias-label-primary,#e8e8e8);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2,#80808066);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2,#80808099);border-radius:0 0 0 20px;flex-direction:column;font:13px/1.45 -apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Microsoft YaHei,sans-serif;display:flex;position:fixed;top:0;bottom:auto;right:0;overflow:hidden}._54xtAa_dshwe-head{border-bottom:1px solid var(--dsw-alias-border-l3,#80808033);flex:none;align-items:center;gap:8px;padding:14px 16px 12px 18px;display:flex}._54xtAa_dshwe-head-ico{color:var(--dsw-alias-state-business-primary,#4176e6);flex:none;display:inline-flex}._54xtAa_dshwe-title{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;font-size:15px;font-weight:600;overflow:hidden}._54xtAa_dshwe-icobtn{color:var(--dsw-alias-label-secondary,#9a9a9a);cursor:pointer;background:0 0;border:0;border-radius:8px;flex:none;justify-content:center;align-items:center;width:28px;height:28px;display:inline-flex}._54xtAa_dshwe-icobtn:hover{background:var(--dsw-alias-interactive-bg-hover,#80808024);color:var(--dsw-alias-label-primary,#e8e8e8)}._54xtAa_dshwe-selrow{align-items:center;gap:8px;padding:12px 16px 4px;display:flex}._54xtAa_dshwe-sel,._54xtAa_dshwe-filter{min-width:0;height:30px;color:var(--dsw-alias-label-primary,#e8e8e8);border:1px solid var(--dsw-alias-border-l2,#80808059);font:inherit;background:0 0;border-radius:8px;outline:none;flex:1;padding:0 8px;font-size:12.5px}._54xtAa_dshwe-sel:focus-visible,._54xtAa_dshwe-filter:focus-visible{border-color:var(--dsw-alias-state-business-primary,#4176e6)}._54xtAa_dshwe-filter::placeholder{color:var(--dsw-alias-label-caption,#8a8a8a)}._54xtAa_dshwe-filterrow{align-items:center;gap:6px;padding:0 16px 6px;display:flex}._54xtAa_dshwe-filter-clear{color:var(--dsw-alias-label-secondary,#9a9a9a);cursor:pointer;background:0 0;border:0;border-radius:6px;flex:none;justify-content:center;align-items:center;width:26px;height:26px;display:inline-flex}._54xtAa_dshwe-filter-clear:hover{color:var(--dsw-alias-label-primary,#e8e8e8);background:var(--dsw-alias-interactive-bg-hover,#8080801f)}._54xtAa_dshwe-addbtn{border:1px solid var(--dsw-alias-border-l2,#80808059);height:30px;color:var(--dsw-alias-label-secondary,#9a9a9a);font:inherit;cursor:pointer;background:0 0;border-radius:8px;flex:none;align-items:center;gap:3px;padding:0 10px;font-size:12.5px;display:inline-flex}._54xtAa_dshwe-addbtn:hover{color:var(--dsw-alias-label-primary,#e8e8e8);background:var(--dsw-alias-interactive-bg-hover,#8080801f)}._54xtAa_dshwe-hintline{color:var(--dsw-alias-label-caption,#8a8a8a);align-items:center;gap:6px;padding:0 18px 8px;font-size:11px;display:flex}._54xtAa_dshwe-tree{flex:1;padding:2px 6px 10px;overflow:auto}._54xtAa_dshwe-row{cursor:pointer;user-select:none;white-space:nowrap;text-align:left;width:100%;color:inherit;font:inherit;background:0 0;border:0;border-radius:10px;align-items:center;gap:7px;padding:4.5px 10px;display:flex}._54xtAa_dshwe-row:hover{background:var(--dsw-alias-interactive-bg-hover,#8080801f)}._54xtAa_dshwe-row-file{cursor:grab}._54xtAa_dshwe-row-file:active{cursor:grabbing}._54xtAa_dshwe-chev-slot{flex:none;justify-content:center;align-items:center;width:14px;display:inline-flex}._54xtAa_dshwe-chev{color:var(--dsw-alias-label-dimmed,#777);transition:transform .16s;display:inline-flex}._54xtAa_dshwe-chev-on{transform:rotate(90deg)}@media (prefers-reduced-motion:reduce){._54xtAa_dshwe-chev{transition:none}}._54xtAa_dshwe-ico{flex:none;justify-content:center;align-items:center;display:inline-flex}._54xtAa_dshwe-folder-svg{color:#dcb67a}._54xtAa_dshwe-name{text-overflow:ellipsis;flex:1;min-width:0;font-size:12.5px;overflow:hidden}._54xtAa_dshwe-row-dir ._54xtAa_dshwe-name{font-weight:600}._54xtAa_dshwe-row-sel{box-shadow:inset 2px 0 0 var(--dsw-alias-state-business-primary,#4176e6);background:#4176e629}._54xtAa_dshwe-row-sel:hover{background:#4176e63d}._54xtAa_dshwe-selbar{border-top:1px solid var(--dsw-alias-border-l3,#80808033);background:var(--dsw-alias-bg-layer-1,#222);flex:none;align-items:center;gap:8px;padding:8px 14px;display:flex}._54xtAa_dshwe-selbar-count{min-width:0;color:var(--dsw-alias-label-primary,#e8e8e8);font-variant-numeric:tabular-nums;flex:1;font-size:12px}._54xtAa_dshwe-pager-btn{border:1px solid var(--dsw-alias-border-l2,#80808059);width:24px;height:24px;color:var(--dsw-alias-label-secondary,#9a9a9a);font:inherit;cursor:pointer;background:0 0;border-radius:7px;flex:none;justify-content:center;align-items:center;font-size:14px;line-height:1;display:inline-flex}._54xtAa_dshwe-pager-btn:hover:not(:disabled){color:var(--dsw-alias-label-primary,#e8e8e8);background:var(--dsw-alias-interactive-bg-hover,#8080801f)}._54xtAa_dshwe-pager-btn:disabled{opacity:.4;cursor:not-allowed}._54xtAa_dshwe-size{color:var(--dsw-alias-label-caption,#8a8a8a);font-variant-numeric:tabular-nums;flex:none;padding-left:6px;font-size:11px}._54xtAa_dshwe-eye{opacity:0;color:var(--dsw-alias-label-secondary,#9a9a9a);cursor:pointer;background:0 0;border:0;border-radius:6px;flex:none;justify-content:center;align-items:center;padding:2px;transition:opacity .12s;display:inline-flex}._54xtAa_dshwe-eye:hover{color:var(--dsw-alias-state-business-primary,#4176e6);background:var(--dsw-alias-interactive-bg-hover,#8080801f)}._54xtAa_dshwe-eye:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#4176e6);outline-offset:-2px}._54xtAa_dshwe-row:hover ._54xtAa_dshwe-eye{opacity:1}._54xtAa_dshwe-note{color:var(--dsw-alias-label-caption,#8a8a8a);align-items:center;gap:8px;padding:6px 16px;font-size:12px;display:flex}._54xtAa_dshwe-note-err{color:var(--dsw-alias-state-error-primary,#e5484d)}._54xtAa_dshwe-spin{border:2px solid var(--dsw-alias-border-l2,#80808066);border-top-color:var(--dsw-alias-state-business-primary,#4176e6);border-radius:50%;flex:none;width:13px;height:13px;animation:.7s linear infinite _54xtAa_dshwe-spin}@keyframes _54xtAa_dshwe-spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){._54xtAa_dshwe-spin{animation-duration:1.6s}}._54xtAa_dshwe-empty{color:var(--dsw-alias-label-secondary,#9a9a9a);flex-direction:column;align-items:flex-start;gap:12px;padding:20px 18px;font-size:12.5px;display:flex}._54xtAa_dshwe-empty-ico{color:var(--dsw-alias-label-dimmed,#777);opacity:.8}._54xtAa_dshwe-preview{border-top:1px solid var(--dsw-alias-border-l3,#80808033);background:var(--dsw-alias-bg-layer-1,#222);flex-direction:column;flex:none;max-height:46%;display:flex}._54xtAa_dshwe-preview-head{align-items:center;gap:8px;padding:10px 14px 6px;display:flex}._54xtAa_dshwe-preview-name{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;font-size:12.5px;font-weight:600;overflow:hidden}._54xtAa_dshwe-preview-meta{color:var(--dsw-alias-label-caption,#8a8a8a);flex:none;font-size:11px}._54xtAa_dshwe-preview-pre{color:var(--dsw-alias-label-primary,#e8e8e8);white-space:pre;flex:1;margin:0;padding:4px 14px 10px;font:11.5px/1.6 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;overflow:auto}._54xtAa_dshwe-preview-actions{align-items:center;gap:8px;padding:0 14px 10px;display:flex}._54xtAa_dshwe-prevbtn{border:1px solid var(--dsw-alias-border-l2,#80808059);color:var(--dsw-alias-label-secondary,#9a9a9a);font:inherit;cursor:pointer;background:0 0;border-radius:8px;flex:none;padding:4px 10px;font-size:12px}._54xtAa_dshwe-prevbtn:hover{color:var(--dsw-alias-label-primary,#e8e8e8);background:var(--dsw-alias-interactive-bg-hover,#8080801f)}._54xtAa_dshwe-prevbtn-primary{color:#fff;background:var(--dsw-alias-state-business-primary,#4176e6);border-color:#0000}._54xtAa_dshwe-prevbtn-primary:hover{opacity:.9}._54xtAa_dshwe-prevbtn:disabled{opacity:.45;cursor:not-allowed}._54xtAa_dshwe-hint{border:1.5px dashed var(--dsw-alias-state-business-primary,#4176e6);pointer-events:none;border-radius:20px;justify-content:center;align-items:center;display:flex;position:absolute;inset:10px}._54xtAa_dshwe-hint-chip{background:var(--dsw-alias-bg-layer-2,#262626);color:var(--dsw-alias-label-primary,#e8e8e8);box-shadow:var(--dsw-shadow-lv2,0 4px 12px #00000040);border-radius:999px;align-items:center;gap:7px;padding:9px 15px;font-size:13px;display:flex}._54xtAa_dshwe-hint-chip svg{color:var(--dsw-alias-state-business-primary,#4176e6)}._54xtAa_dshwe-act{color:var(--dsw-alias-label-secondary,#9a9a9a);cursor:pointer;font:inherit;background:0 0;border:0;border-radius:8px;align-items:center;gap:6px;padding:5px 8px;display:inline-flex}._54xtAa_dshwe-act:hover{background:var(--dsw-alias-interactive-bg-hover,#8080801f);color:var(--dsw-alias-label-primary,#e8e8e8)}._54xtAa_dshwe-act-on{color:var(--dsw-alias-state-business-primary,#4176e6)}._54xtAa_dshwe-row:focus-visible,._54xtAa_dshwe-hicon:focus-visible,._54xtAa_dshwe-icobtn:focus-visible,._54xtAa_dshwe-act:focus-visible,._54xtAa_dshwe-addbtn:focus-visible,._54xtAa_dshwe-prevbtn:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#4176e6);outline-offset:-2px}._54xtAa_dshwe-tabs{border-bottom:1px solid var(--dsw-alias-border-l3,#80808033);flex:none;gap:2px;padding:0 14px;display:flex}._54xtAa_dshwe-tab{height:36px;color:var(--dsw-alias-label-secondary,#9a9a9a);font:inherit;cursor:pointer;background:0 0;border:0;border-radius:10px 10px 0 0;flex:1;justify-content:center;align-items:center;gap:6px;font-size:12.5px;font-weight:500;display:inline-flex;position:relative}._54xtAa_dshwe-tab:hover{color:var(--dsw-alias-label-primary,#e8e8e8);background:var(--dsw-alias-interactive-bg-hover,#80808014)}._54xtAa_dshwe-tab-on{color:var(--dsw-alias-label-primary,#e8e8e8)}._54xtAa_dshwe-tab-ind{background:var(--dsw-alias-state-business-primary,#4176e6);opacity:0;border-radius:999px;height:2px;transition:opacity .16s,transform .16s;position:absolute;bottom:-1px;left:24%;right:24%;transform:scaleX(.4)}._54xtAa_dshwe-tab-on ._54xtAa_dshwe-tab-ind{opacity:1;transform:scaleX(1)}._54xtAa_dshwe-tab:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#4176e6);outline-offset:-2px}@media (prefers-reduced-motion:reduce){._54xtAa_dshwe-tab-ind{transition:none}}._54xtAa_dshwe-tabbody{flex-direction:column;flex:1;min-height:0;display:flex}._54xtAa_dshwe-set{flex-direction:column;flex:1;gap:2px;padding:8px 16px 14px;display:flex;overflow:auto}._54xtAa_dshwe-setsec{letter-spacing:.05em;text-transform:uppercase;color:var(--dsw-alias-label-caption,#8a8a8a);padding:10px 4px 6px;font-size:11px;font-weight:600}._54xtAa_dshwe-setrow{border-radius:12px;align-items:center;gap:12px;padding:9px 10px;display:flex}._54xtAa_dshwe-setrow:hover{background:var(--dsw-alias-interactive-bg-hover,#8080800f)}._54xtAa_dshwe-setinfo{flex-direction:column;flex:1;gap:2px;min-width:0;display:flex}._54xtAa_dshwe-setlabel{color:var(--dsw-alias-label-primary,#e8e8e8);font-size:12.5px}._54xtAa_dshwe-setcap{color:var(--dsw-alias-label-caption,#8a8a8a);font-size:11px}._54xtAa_dshwe-switch{border:1px solid var(--dsw-alias-border-l2,#80808066);background:var(--dsw-alias-interactive-bg-hover,#8080802e);cursor:pointer;border-radius:999px;flex:none;width:34px;height:20px;padding:0;transition:background .15s,border-color .15s;position:relative}._54xtAa_dshwe-switch:after{content:\"\";background:var(--dsw-alias-label-secondary,#9a9a9a);border-radius:50%;width:14px;height:14px;transition:transform .15s;position:absolute;top:2px;left:2px}._54xtAa_dshwe-switch[aria-checked=true]{background:var(--dsw-alias-state-business-primary,#4176e6);border-color:#0000}._54xtAa_dshwe-switch[aria-checked=true]:after{background:#fff;transform:translate(14px)}@media (prefers-reduced-motion:reduce){._54xtAa_dshwe-switch,._54xtAa_dshwe-switch:after{transition:none}}._54xtAa_dshwe-setselect{min-width:118px;height:28px;color:var(--dsw-alias-label-primary,#e8e8e8);border:1px solid var(--dsw-alias-border-l2,#80808059);font:inherit;background:0 0;border-radius:8px;outline:none;flex:none;padding:0 8px;font-size:12px}._54xtAa_dshwe-setselect:focus-visible{border-color:var(--dsw-alias-state-business-primary,#4176e6)}._54xtAa_dshwe-setfoot{justify-content:flex-end;padding:8px 4px 2px;display:flex}._54xtAa_dshwe-setnote{color:var(--dsw-alias-label-dimmed,#777);padding:2px 10px 8px;font-size:11px}._54xtAa_dshwe-setpage{max-width:640px;padding:8px 8px 28px}";
		const tagId = "@jiyr0119/dsh-workspace-explorer/panel.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@jiyr0119/dsh-workspace-explorer";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var panel_module_css_default = {
			"dshwe-eye": "_54xtAa_dshwe-eye",
			"dshwe-icobtn": "_54xtAa_dshwe-icobtn",
			"dshwe-empty": "_54xtAa_dshwe-empty",
			"dshwe-hint-chip": "_54xtAa_dshwe-hint-chip",
			"dshwe-tabs": "_54xtAa_dshwe-tabs",
			"dshwe-tab-on": "_54xtAa_dshwe-tab-on",
			"dshwe-filter": "_54xtAa_dshwe-filter",
			"dshwe-tab-ind": "_54xtAa_dshwe-tab-ind",
			"dshwe-setcap": "_54xtAa_dshwe-setcap",
			"dshwe-chev-on": "_54xtAa_dshwe-chev-on",
			"dshwe-panel": "_54xtAa_dshwe-panel",
			"dshwe-tab": "_54xtAa_dshwe-tab",
			"dshwe-hintline": "_54xtAa_dshwe-hintline",
			"dshwe-name": "_54xtAa_dshwe-name",
			"dshwe-head": "_54xtAa_dshwe-head",
			"dshwe-empty-ico": "_54xtAa_dshwe-empty-ico",
			"dshwe-preview-name": "_54xtAa_dshwe-preview-name",
			"dshwe-preview-actions": "_54xtAa_dshwe-preview-actions",
			"dshwe-preview-head": "_54xtAa_dshwe-preview-head",
			"dshwe-head-ico": "_54xtAa_dshwe-head-ico",
			"dshwe-selrow": "_54xtAa_dshwe-selrow",
			"dshwe-prevbtn": "_54xtAa_dshwe-prevbtn",
			"dshwe-size": "_54xtAa_dshwe-size",
			"dshwe-hicon-on": "_54xtAa_dshwe-hicon-on",
			"dshwe-preview": "_54xtAa_dshwe-preview",
			"dshwe-hint": "_54xtAa_dshwe-hint",
			"dshwe-switch": "_54xtAa_dshwe-switch",
			"dshwe-row": "_54xtAa_dshwe-row",
			"dshwe-setnote": "_54xtAa_dshwe-setnote",
			"dshwe-chev-slot": "_54xtAa_dshwe-chev-slot",
			"dshwe-preview-pre": "_54xtAa_dshwe-preview-pre",
			"dshwe-row-sel": "_54xtAa_dshwe-row-sel",
			"dshwe-sel": "_54xtAa_dshwe-sel",
			"dshwe-prevbtn-primary": "_54xtAa_dshwe-prevbtn-primary",
			"dshwe-addbtn": "_54xtAa_dshwe-addbtn",
			"dshwe-setlabel": "_54xtAa_dshwe-setlabel",
			"dshwe-act": "_54xtAa_dshwe-act",
			"dshwe-row-file": "_54xtAa_dshwe-row-file",
			"dshwe-note-err": "_54xtAa_dshwe-note-err",
			"dshwe-setinfo": "_54xtAa_dshwe-setinfo",
			"dshwe-filterrow": "_54xtAa_dshwe-filterrow",
			"dshwe-preview-meta": "_54xtAa_dshwe-preview-meta",
			"dshwe-tabbody": "_54xtAa_dshwe-tabbody",
			"dshwe-selbar": "_54xtAa_dshwe-selbar",
			"dshwe-popup-on": "_54xtAa_dshwe-popup-on",
			"dshwe-selbar-count": "_54xtAa_dshwe-selbar-count",
			"dshwe-spin": "_54xtAa_dshwe-spin",
			"dshwe-act-on": "_54xtAa_dshwe-act-on",
			"dshwe-setpage": "_54xtAa_dshwe-setpage",
			"dshwe-row-dir": "_54xtAa_dshwe-row-dir",
			"dshwe-filter-clear": "_54xtAa_dshwe-filter-clear",
			"dshwe-title": "_54xtAa_dshwe-title",
			"dshwe-set": "_54xtAa_dshwe-set",
			"dshwe-layer": "_54xtAa_dshwe-layer",
			"dshwe-note": "_54xtAa_dshwe-note",
			"dshwe-ico": "_54xtAa_dshwe-ico",
			"dshwe-folder-svg": "_54xtAa_dshwe-folder-svg",
			"dshwe-popup": "_54xtAa_dshwe-popup",
			"dshwe-pager-btn": "_54xtAa_dshwe-pager-btn",
			"dshwe-tree": "_54xtAa_dshwe-tree",
			"dshwe-setsec": "_54xtAa_dshwe-setsec",
			"dshwe-hicon": "_54xtAa_dshwe-hicon",
			"dshwe-chev": "_54xtAa_dshwe-chev",
			"dshwe-setrow": "_54xtAa_dshwe-setrow",
			"dshwe-setfoot": "_54xtAa_dshwe-setfoot",
			"dshwe-setselect": "_54xtAa_dshwe-setselect"
		};
		//#endregion
		//#region src/client/format.ts
		/**
		* 纯格式化工具(浏览器端,无 DOM / 无副作用),供面板与单元测试复用。
		*/
		/** 人类可读文件大小(空值返回空串)。 */
		const fmtSize = (n) => {
			if (n == null) return "";
			if (n < 1024) return `${n} B`;
			if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
			return `${(n / 1048576).toFixed(1)} MB`;
		};
		/** 浏览器安全的 basename(兼容正斜杠结尾;DSH 内不依赖 node:path)。 */
		const basename = (p) => {
			const s = p.replace(/\/+$/, "");
			const i = s.lastIndexOf("/");
			return i >= 0 ? s.slice(i + 1) : s;
		};
		/** 取小写扩展名;点开头(隐藏文件)或无扩展名返回空串。 */
		const extOf = (name) => {
			const i = name.lastIndexOf(".");
			return i <= 0 ? "" : name.slice(i + 1).toLowerCase();
		};
		/** 把 /dsh-we/api/tree 的平铺条目渲染成带缩进与树形连线的文本块(目录拖拽 / 多选批量插入共用)。 */
		function formatTreeBlock(name, entries, truncated) {
			const root = {
				name,
				type: "directory",
				children: []
			};
			const map = /* @__PURE__ */ new Map([["", root]]);
			for (const e of entries) {
				const segs = e.rel.split("/");
				const node = {
					name: e.name,
					type: e.type,
					children: []
				};
				map.set(e.rel, node);
				const parent = segs.length > 1 ? segs.slice(0, -1).join("/") : "";
				map.get(parent)?.children.push(node);
			}
			const out = [];
			const walk = (node, prefix, isLast, isRoot) => {
				if (isRoot) out.push(`${node.name}/`);
				else {
					out.push(`${prefix}${isLast ? "└── " : "├── "}${node.name}${node.type === "directory" ? "/" : ""}`);
					prefix += isLast ? "    " : "│   ";
				}
				node.children.forEach((c, i) => walk(c, prefix, i === node.children.length - 1, false));
			};
			walk(root, "", true, true);
			if (truncated) out.push("…");
			return out.join("\n");
		}
		//#endregion
		//#region src/client/index.tsx
		/**
		* dsh-workspace-explorer — Client 半区(原生包 v0.3)
		*
		* 交互对标 dsh-better-sidebar:面板顶部 Tab 栏(文件 / 设置)切换页面;
		* 设置页逐项开关/下拉实时生效;并注册 DSH 设置壳的 settings.section 页。
		* 通过 /dsh-we/api/* JSON 路由调用 Host(list / peek / config)。
		* 浏览器 bundle(src/client/index.tsx → lib/client.js,__ModuleLoader__ 格式)。
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
				hint: "点击/拖拽插入;Shift 或 ⌘ 点击可多选批量插入",
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
				"drop.hint.dir": "松开以插入目录树",
				"add.ws": "添加工作区",
				"dir.tree.fail": "目录树生成失败: ",
				"sel.count": "已选 {n} 项",
				"sel.insert": "插入所选",
				"sel.clear": "清除",
				"preview.page": "第 {n} 页",
				"preview.lines": "{n} 行",
				"preview.prev": "上一页",
				"preview.next": "下一页",
				"tab.files": "文件",
				"tab.settings": "设置",
				"settings.title": "面板设置",
				"settings.general": "通用",
				"settings.hideNoise": "隐藏噪声目录",
				"settings.hideNoise.desc": ".git · node_modules · dist 等",
				"settings.showSize": "显示文件大小",
				"settings.refStyle": "文件引用格式",
				"settings.refStyle.rel": "相对路径",
				"settings.refStyle.abs": "绝对路径",
				"settings.peekLines": "预览行数",
				"settings.width": "面板宽度",
				"settings.width.narrow": "紧凑",
				"settings.width.std": "标准",
				"settings.width.wide": "宽松",
				"settings.restore": "恢复默认",
				"settings.note": "配置在本次会话内生效,重启插件后恢复默认。",
				"settings.nav": "工作区文件",
				"drawer.tip": "文件目录",
				"drawer.open": "打开文件抽屉",
				"drawer.label": "工作区文件"
			},
			en: {
				"panel.title": "Workspace Files",
				"ws.current": "Current dir",
				"search.ph": "Search files (loaded dirs only)…",
				hint: "Click / drag to insert; Shift or ⌘ click to select multiple",
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
				"drop.hint.dir": "Release to insert the folder tree",
				"add.ws": "Add workspace",
				"dir.tree.fail": "Folder tree failed: ",
				"sel.count": "{n} selected",
				"sel.insert": "Insert",
				"sel.clear": "Clear",
				"preview.page": "Page {n}",
				"preview.lines": "{n} lines",
				"preview.prev": "Previous page",
				"preview.next": "Next page",
				"tab.files": "Files",
				"tab.settings": "Settings",
				"settings.title": "Panel settings",
				"settings.general": "General",
				"settings.hideNoise": "Hide noise dirs",
				"settings.hideNoise.desc": ".git · node_modules · dist …",
				"settings.showSize": "Show file sizes",
				"settings.refStyle": "File reference format",
				"settings.refStyle.rel": "Relative path",
				"settings.refStyle.abs": "Absolute path",
				"settings.peekLines": "Preview lines",
				"settings.width": "Panel width",
				"settings.width.narrow": "Narrow",
				"settings.width.std": "Standard",
				"settings.width.wide": "Wide",
				"settings.restore": "Reset to defaults",
				"settings.note": "Settings apply for this run; they reset when the plugin restarts.",
				"settings.nav": "Workspace Explorer",
				"drawer.tip": "Files",
				"drawer.open": "Open files drawer",
				"drawer.label": "Workspace Files"
			}
		};
		let workspacesSvc = null;
		const FOLDER_D = "M1.5 2.5A1.5 1.5 0 0 1 3 1h3.2l1.6 2H13a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 13 13H3a1.5 1.5 0 0 1-1.5-1.5v-9z";
		const DOC_BODY = "M4.3 1.7h5.3l2.7 2.7v8.9a1 1 0 0 1-1 1H4.3a1 1 0 0 1-1-1V2.7a1 1 0 0 1 1-1z";
		const DOC_FOLD = "M9.6 1.7L12.3 4.4H9.6z";
		const GEAR_D = "M8 9.9a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8zM8 4.3V2.9M8 13.1v-1.4M4.3 8H2.9M13.1 8h-1.4M5.2 5.2L4.1 4.1M11.9 11.9l-1.1-1.1M5.2 10.8L4.1 11.9M11.9 4.1l-1.1 1.1";
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
		const NOISE = [
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
		const CFG_DEFAULTS = {
			hideNoise: true,
			showSize: true,
			refStyle: "relative",
			peekLines: 60,
			width: 384
		};
		let cfg = { ...CFG_DEFAULTS };
		const cfgListeners = /* @__PURE__ */ new Set();
		const getCfg = () => cfg;
		const notifyCfg = () => {
			cfgListeners.forEach((fn) => fn(cfg));
		};
		const syncHostCfg = () => {
			api("config", {
				ignore: cfg.hideNoise ? NOISE.slice() : [],
				peekMaxLines: cfg.peekLines
			}).catch(() => {});
		};
		const setCfg = (patch) => {
			cfg = {
				...cfg,
				...patch
			};
			notifyCfg();
			syncHostCfg();
		};
		const resetCfg = () => {
			cfg = { ...CFG_DEFAULTS };
			notifyCfg();
			syncHostCfg();
		};
		const subscribeCfg = (fn) => {
			cfgListeners.add(fn);
			return () => {
				cfgListeners.delete(fn);
			};
		};
		syncHostCfg();
		async function fetchTreeText(root, rel, depth = 3) {
			try {
				const res = await api("tree", {
					root,
					rel,
					depth
				});
				if (!res.ok || !res.entries) {
					console.warn("ws-tree.tree failed", res.error);
					return null;
				}
				return formatTreeBlock(res.name ?? basename(root), res.entries, res.truncated === true);
			} catch (err) {
				console.warn("ws-tree.tree failed", String(err?.message ?? err));
				return null;
			}
		}
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
		function TabFolderSvg() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				viewBox: "0 0 16 16",
				width: 13,
				height: 13,
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: FOLDER_D,
					fill: "currentColor"
				})
			});
		}
		function GearSvg() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				viewBox: "0 0 16 16",
				width: 13,
				height: 13,
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: GEAR_D,
					fill: "none",
					stroke: "currentColor",
					strokeWidth: 1.3,
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
		const toggleDrawer = () => {
			setOpen(!getOpen());
		};
		const closeDrawer = () => {
			setOpen(false);
		};
		const measurePopup = () => {
			const vh = window.innerHeight;
			const header = document.querySelector("[data-slot=\"conversation.session.header\"]");
			const composer = document.querySelector("[data-composer-card]");
			const top = header ? Math.round(header.getBoundingClientRect().bottom) + 8 : 48;
			const bottomLimit = composer ? Math.round(composer.getBoundingClientRect().top) - 8 : vh - 48;
			return {
				top,
				height: Math.max(200, bottomLimit - top)
			};
		};
		let bridge = null;
		const setBridge = (b) => {
			bridge = b;
		};
		const getBridge = () => bridge;
		function HeaderAction() {
			const [on, setOn] = (0, react.useState)(getOpen());
			(0, react.useEffect)(() => subscribeOpen(setOn), []);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: C("dshwe-hicon") + (on ? ` ${C("dshwe-hicon-on")}` : ""),
				onClick: toggleDrawer,
				title: tr("drawer.tip"),
				"aria-label": tr("drawer.open"),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("drawer.label") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
					viewBox: "0 0 16 16",
					width: 13,
					height: 13,
					"aria-hidden": "true",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						d: FOLDER_D,
						fill: "currentColor"
					})
				})]
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
		function SwitchRow(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: C("dshwe-setrow"),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: C("dshwe-setinfo"),
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: C("dshwe-setlabel"),
						children: props.label
					}), props.caption ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: C("dshwe-setcap"),
						children: props.caption
					}) : null]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					role: "switch",
					"aria-checked": props.checked,
					className: C("dshwe-switch"),
					onClick: () => props.onChange(!props.checked),
					"aria-label": props.label
				})]
			});
		}
		function SelectRow(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: C("dshwe-setrow"),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: C("dshwe-setinfo"),
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: C("dshwe-setlabel"),
						children: props.label
					}), props.caption ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: C("dshwe-setcap"),
						children: props.caption
					}) : null]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
					className: C("dshwe-setselect"),
					value: props.value,
					onChange: (e) => props.onChange(e.target.value),
					children: props.options.map((o) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
						value: o.value,
						children: o.label
					}, o.value))
				})]
			});
		}
		function SettingsView() {
			const [c, setC] = (0, react.useState)(getCfg());
			(0, react.useEffect)(() => subscribeCfg(setC), []);
			const widthOpts = [
				{
					value: "320",
					label: `${tr("settings.width.narrow")} · 320`
				},
				{
					value: "384",
					label: `${tr("settings.width.std")} · 384`
				},
				{
					value: "480",
					label: `${tr("settings.width.wide")} · 480`
				}
			];
			const refOpts = [{
				value: "relative",
				label: tr("settings.refStyle.rel")
			}, {
				value: "absolute",
				label: tr("settings.refStyle.abs")
			}];
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: C("dshwe-set"),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: C("dshwe-setsec"),
						children: tr("settings.general")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SwitchRow, {
						label: tr("settings.hideNoise"),
						caption: tr("settings.hideNoise.desc"),
						checked: c.hideNoise,
						onChange: (v) => setCfg({ hideNoise: v })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SwitchRow, {
						label: tr("settings.showSize"),
						checked: c.showSize,
						onChange: (v) => setCfg({ showSize: v })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SelectRow, {
						label: tr("settings.refStyle"),
						value: c.refStyle,
						options: refOpts,
						onChange: (v) => setCfg({ refStyle: v })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SelectRow, {
						label: tr("settings.peekLines"),
						value: String(c.peekLines),
						options: [
							{
								value: "30",
								label: "30"
							},
							{
								value: "60",
								label: "60"
							},
							{
								value: "120",
								label: "120"
							}
						],
						onChange: (v) => setCfg({ peekLines: Number(v) })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SelectRow, {
						label: tr("settings.width"),
						value: String(c.width),
						options: widthOpts,
						onChange: (v) => setCfg({ width: Number(v) })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: C("dshwe-setfoot"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: C("dshwe-prevbtn"),
							onClick: resetCfg,
							children: tr("settings.restore")
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: C("dshwe-setnote"),
						children: tr("settings.note")
					})
				]
			});
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
			const [selected, setSelected] = (0, react.useState)(/* @__PURE__ */ new Set());
			const [selAnchor, setSelAnchor] = (0, react.useState)(null);
			const [tab, setTab] = (0, react.useState)("files");
			const [c, setC] = (0, react.useState)(getCfg());
			(0, react.useEffect)(() => subscribeCfg(setC), []);
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
			const knownRoots = /* @__PURE__ */ new Set();
			if (cwd) knownRoots.add(cwd);
			for (const w of workspaces) knownRoots.add(w.path);
			(0, react.useEffect)(() => {
				if (root === null || knownRoots.has(root)) return;
				setRoot(cwd ?? workspaces[0]?.path ?? null);
			}, [
				root,
				cwd,
				wsState.items
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
				setSelected(/* @__PURE__ */ new Set());
				setSelAnchor(null);
				loadDir(root, "");
			}, [root, loadDir]);
			(0, react.useEffect)(() => {
				if (root === null) return;
				loadDir(root, "");
				Object.keys(expanded).forEach((rel) => {
					if (rel !== "") loadDir(root, rel);
				});
			}, [c.hideNoise]);
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
			const markerFor = (entry) => c.refStyle === "relative" && root === cwd ? `[file: ${entry.rel}]` : `[file: ${entry.path}]`;
			const insertMarker = (entry) => {
				const b = getBridge();
				if (b) b.insert(markerFor(entry));
			};
			const loadPreviewPage = (0, react.useCallback)(async (entry, page) => {
				setPreview({
					entry,
					loading: true,
					data: null,
					error: null,
					page
				});
				try {
					const res = await api("peek", {
						root: root ?? "",
						rel: entry.rel,
						offset: page * c.peekLines,
						limit: c.peekLines
					});
					if (!res.ok) throw new Error(res.error ?? "unknown");
					setPreview({
						entry,
						loading: false,
						data: res,
						error: null,
						page
					});
				} catch (err) {
					setPreview({
						entry,
						loading: false,
						data: null,
						error: String(err?.message ?? err),
						page
					});
				}
			}, [root, c.peekLines]);
			const openPreview = (entry) => {
				loadPreviewPage(entry, 0);
			};
			const previewPrev = () => {
				if (preview && preview.page > 0 && !preview.loading) loadPreviewPage(preview.entry, preview.page - 1);
			};
			const previewNext = () => {
				if (preview && preview.data?.hasMore && !preview.loading) loadPreviewPage(preview.entry, preview.page + 1);
			};
			const insertContent = async () => {
				if (!preview || preview.loading || preview.error || !preview.data || root === null) return;
				const d = preview.data;
				if (d.binary || (d.size ?? 0) > 32768) return;
				const res = await api("peek", {
					root,
					rel: preview.entry.rel,
					whole: true
				});
				if (!res.ok || res.content == null) return;
				const b = getBridge();
				if (b) b.insert(res.content);
			};
			const onDragStart = (ev, entry) => {
				ev.dataTransfer.setData("text/plain", entry.type === "directory" ? entry.name : markerFor(entry));
				ev.dataTransfer.setData(MARKER, JSON.stringify({
					root,
					rel: entry.rel,
					name: entry.name,
					type: entry.type
				}));
				ev.dataTransfer.effectAllowed = "copy";
				props.onDraggingChange(entry.type === "directory" ? "dir" : "file");
			};
			const addWorkspace = async () => {
				if (!workspacesSvc) return;
				try {
					const p = await workspacesSvc.pickDirectory();
					if (!p) return;
					const v = await workspacesSvc.create({ path: p });
					if (v?.path) setRoot(v.path);
				} catch (err) {
					console.warn("addWorkspace failed", String(err?.message ?? err));
				}
			};
			const q = filter.trim().toLowerCase();
			const collectMatches = (rel, out) => {
				const data = dirs[rel];
				if (!data) return;
				for (const entry of data.entries) {
					if (entry.name.toLowerCase().includes(q)) out.push(entry);
					if (entry.type === "directory") collectMatches(entry.rel, out);
				}
			};
			const flatVisible = () => {
				if (q !== "") {
					const hits = [];
					collectMatches("", hits);
					return hits;
				}
				const out = [];
				const walk = (rel) => {
					const data = dirs[rel];
					if (!data) return;
					for (const entry of data.entries) {
						out.push(entry);
						if (entry.type === "directory" && expanded[entry.rel]) walk(entry.rel);
					}
				};
				walk("");
				return out;
			};
			const onRowClick = (ev, entry) => {
				const isDir = entry.type === "directory";
				if (ev.shiftKey || ev.metaKey || ev.ctrlKey) {
					ev.preventDefault();
					if (ev.shiftKey && selAnchor !== null) {
						const list = flatVisible();
						const a = list.findIndex((e) => e.rel === selAnchor);
						const b = list.findIndex((e) => e.rel === entry.rel);
						if (a >= 0 && b >= 0) {
							const [lo, hi] = a < b ? [a, b] : [b, a];
							const range = list.slice(lo, hi + 1).map((e) => e.rel);
							setSelected((prev) => /* @__PURE__ */ new Set([...prev, ...range]));
						}
					} else setSelected((prev) => {
						const n = new Set(prev);
						if (n.has(entry.rel)) n.delete(entry.rel);
						else n.add(entry.rel);
						return n;
					});
					setSelAnchor(entry.rel);
				} else if (isDir) toggle(entry.rel);
				else insertMarker(entry);
			};
			const insertSelected = async () => {
				const b = getBridge();
				if (!b) return;
				const rels = new Set(selected);
				const list = flatVisible().filter((e) => rels.has(e.rel));
				const parts = [];
				for (const e of list) if (e.type === "directory") {
					const text = await fetchTreeText(root ?? "", e.rel);
					if (text) parts.push(text);
				} else parts.push(markerFor(e));
				if (parts.length > 0) b.insert(parts.join("\n"));
				setSelected(/* @__PURE__ */ new Set());
				setSelAnchor(null);
			};
			const rowFor = (entry, depth, isExp) => {
				const isDir = entry.type === "directory";
				const isSel = selected.has(entry.rel);
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					role: "button",
					tabIndex: 0,
					className: C("dshwe-row") + (isDir ? ` ${C("dshwe-row-dir")}` : ` ${C("dshwe-row-file")}`) + (isSel ? ` ${C("dshwe-row-sel")}` : ""),
					style: { paddingLeft: 10 + depth * 16 },
					title: entry.path + (isDir ? "" : ` · ${tr("row.tip")}`),
					draggable: true,
					onDragStart: (ev) => onDragStart(ev, entry),
					onClick: (ev) => onRowClick(ev, entry),
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
						!isDir && c.showSize && entry.size != null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: C("dshwe-size"),
							children: fmtSize(entry.size)
						}) : null,
						!isDir ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: C("dshwe-eye"),
							title: tr("preview.tip"),
							"aria-label": tr("preview.tip"),
							onMouseDown: (e) => {
								e.preventDefault();
								e.stopPropagation();
							},
							onClick: (e) => {
								e.stopPropagation();
								openPreview(entry);
							},
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
				const noteKey = (tag) => `${rel}::${tag}`;
				if (data.truncated) rows.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: C("dshwe-note"),
					children: tr("truncated", { n: data.entries.length })
				}, noteKey("trunc")));
				if (data.loading) rows.push(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: C("dshwe-note"),
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: C("dshwe-spin") }), tr("loading")]
				}, noteKey("load")));
				if (data.error) rows.push(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: C("dshwe-note dshwe-note-err"),
					children: [tr("load.fail"), data.error]
				}, noteKey("err")));
				return rows;
			};
			let body;
			if (q !== "") {
				const hits = [];
				collectMatches("", hits);
				body = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: C("dshwe-note"),
					children: tr("hit", { n: hits.length })
				}), hits.length ? hits.map((h) => rowFor(h, 0, false)) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: C("dshwe-empty"),
					children: tr("hit.none", { q: filter })
				})] });
			} else if (root === null) body = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: C("dshwe-empty"),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
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
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: tr("empty.title") }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: C("dshwe-addbtn"),
						onClick: () => void addWorkspace(),
						children: tr("empty.add")
					})
				]
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
				else if (d?.binary) contentArea = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: C("dshwe-note"),
					children: tr("binary")
				});
				else contentArea = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
					className: C("dshwe-preview-pre"),
					children: d?.content ?? ""
				});
				const canInline = !preview.loading && !preview.error && !!d && !d.binary && (d.size ?? 0) <= 32768;
				const metaBits = [];
				if (preview.entry.size != null) metaBits.push(fmtSize(preview.entry.size));
				if (d?.lineCount != null && d.lineCount > 0) metaBits.push(tr("preview.lines", { n: d.lineCount }));
				if (preview.page > 0 || d?.hasMore === true) metaBits.push(tr("preview.page", { n: preview.page + 1 }));
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
									children: metaBits.join(" · ")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: C("dshwe-pager-btn"),
									disabled: preview.page === 0 || preview.loading,
									onClick: previewPrev,
									title: tr("preview.prev"),
									"aria-label": tr("preview.prev"),
									children: "‹"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: C("dshwe-pager-btn"),
									disabled: d?.hasMore !== true || preview.loading,
									onClick: previewNext,
									title: tr("preview.next"),
									"aria-label": tr("preview.next"),
									children: "›"
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
								onClick: () => void insertContent(),
								children: tr("btn.content")
							})]
						})
					]
				});
			}
			const filesBody = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
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
				selected.size > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: C("dshwe-selbar"),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: C("dshwe-selbar-count"),
							children: tr("sel.count", { n: selected.size })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: C("dshwe-prevbtn"),
							onClick: () => void insertSelected(),
							children: tr("sel.insert")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: C("dshwe-prevbtn"),
							onClick: () => {
								setSelected(/* @__PURE__ */ new Set());
								setSelAnchor(null);
							},
							children: tr("sel.clear")
						})
					]
				}) : null,
				pv
			] });
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
								onClick: closeDrawer,
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
						className: C("dshwe-tabs"),
						role: "tablist",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							role: "tab",
							"aria-selected": tab === "files",
							className: C("dshwe-tab") + (tab === "files" ? ` ${C("dshwe-tab-on")}` : ""),
							onClick: () => setTab("files"),
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(TabFolderSvg, {}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("tab.files") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: C("dshwe-tab-ind") })
							]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							role: "tab",
							"aria-selected": tab === "settings",
							className: C("dshwe-tab") + (tab === "settings" ? ` ${C("dshwe-tab-on")}` : ""),
							onClick: () => setTab("settings"),
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(GearSvg, {}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("tab.settings") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: C("dshwe-tab-ind") })
							]
						})]
					}),
					tab === "files" ? filesBody : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: C("dshwe-tabbody"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SettingsView, {})
					})
				]
			});
		}
		function DrawerRoot(props) {
			const [on, setOn] = (0, react.useState)(getOpen());
			const [shown, setShown] = (0, react.useState)(getOpen());
			const [closing, setClosing] = (0, react.useState)(false);
			const [rect, setRect] = (0, react.useState)({
				top: 48,
				height: 480
			});
			const [dragKind, setDragKind] = (0, react.useState)(null);
			const [c, setC] = (0, react.useState)(getCfg());
			(0, react.useEffect)(() => subscribeOpen(setOn), []);
			(0, react.useEffect)(() => subscribeCfg(setC), []);
			(0, react.useEffect)(() => {
				if (on) {
					setClosing(false);
					setShown(false);
					const raf = requestAnimationFrame(() => setShown(true));
					return () => cancelAnimationFrame(raf);
				}
				setShown(false);
				setClosing(true);
				const t = setTimeout(() => setClosing(false), 200);
				return () => clearTimeout(t);
			}, [on]);
			(0, react.useEffect)(() => {
				const onKey = (e) => {
					if (e.key === "Escape") closeDrawer();
				};
				document.addEventListener("keydown", onKey);
				return () => document.removeEventListener("keydown", onKey);
			}, []);
			(0, react.useEffect)(() => {
				const update = () => setRect(measurePopup());
				update();
				const ro = new ResizeObserver(update);
				const header = document.querySelector("[data-slot=\"conversation.session.header\"]");
				const composer = document.querySelector("[data-composer-card]");
				if (header) ro.observe(header);
				if (composer) ro.observe(composer);
				window.addEventListener("resize", update);
				return () => {
					ro.disconnect();
					window.removeEventListener("resize", update);
				};
			}, []);
			(0, react.useEffect)(() => {
				const hasMarker = (e) => !!e.dataTransfer && Array.from(e.dataTransfer.types ?? []).includes(MARKER);
				const readPayload = (e) => {
					const raw = e.dataTransfer?.getData(MARKER) ?? "";
					try {
						return raw ? JSON.parse(raw) : null;
					} catch {
						return null;
					}
				};
				const onDragOver = (e) => {
					if (!hasMarker(e)) return;
					e.preventDefault();
					if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
				};
				const onDrop = (e) => {
					if (!hasMarker(e)) return;
					const payload = readPayload(e);
					const inComposer = !!(e.target instanceof HTMLElement ? e.target : null)?.closest("[data-composer-card] textarea");
					if (payload?.type === "directory") {
						e.preventDefault();
						e.stopPropagation();
						setDragKind(null);
						(async () => {
							if (!payload.root) return;
							const text = await fetchTreeText(payload.root, payload.rel ?? "");
							if (text) getBridge()?.insert(text);
						})();
						return;
					}
					if (inComposer) {
						setDragKind(null);
						return;
					}
					e.preventDefault();
					e.stopPropagation();
					setDragKind(null);
					const markerText = e.dataTransfer?.getData("text/plain") ?? "";
					if (markerText !== "") getBridge()?.insert(markerText);
				};
				const onDragEnd = () => setDragKind(null);
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
				children: [dragKind !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
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
						}), dragKind === "dir" ? tr("drop.hint.dir") : tr("drop.hint")]
					})
				}) : null, on || closing ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: C("dshwe-popup") + (shown ? ` ${C("dshwe-popup-on")}` : ""),
					style: {
						top: rect.top,
						height: rect.height,
						width: c.width
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Panel, {
						...props,
						onDraggingChange: setDragKind
					})
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
			workspacesSvc = ctx.get("workspaces") ?? null;
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
			slots.inject("conversation.session.header.utilities", () => slots.register({
				name: "conversation.session.header.utilities",
				id: "workspace-explorer-drawer",
				order: 20,
				label: () => tr("drawer.tip")
			}, () => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(HeaderAction, {})));
			slots.inject("sidebar.footer.action", () => slots.register({
				name: "sidebar.footer.action",
				id: "workspace-explorer"
			}, () => null));
			slots.inject("shell.overlay", () => slots.register({
				name: "shell.overlay",
				id: "workspace-explorer-panel"
			}, (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DrawerRoot, { ...props })));
			slots.inject("conversation.input.dock", () => slots.register({
				name: "conversation.input.dock",
				id: "workspace-explorer-bridge"
			}, (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DockBridge, { ...props })));
			slots.inject("settings.section", () => slots.register({
				name: "settings.section",
				id: "workspace-explorer",
				order: 30,
				label: () => tr("settings.nav")
			}, () => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: C("dshwe-setpage"),
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SettingsView, {})
			})));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
