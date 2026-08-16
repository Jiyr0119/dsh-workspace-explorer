# dsh-workspace-explorer

**[English](README.md)** | [中文](README.zh.md)

[![License](https://img.shields.io/github/license/Jiyr0119/dsh-workspace-explorer)](LICENSE)
[![Pages](https://img.shields.io/github/actions/workflow/status/Jiyr0119/dsh-workspace-explorer/pages.yml?label=pages%20deploy)](https://Jiyr0119.github.io/dsh-workspace-explorer/)
[![Last commit](https://img.shields.io/github/last-commit/Jiyr0119/dsh-workspace-explorer)](https://github.com/Jiyr0119/dsh-workspace-explorer)

> A workspace file explorer for the DeepSeek Harness Web UI: a right-side panel showing the current workspace's directory tree — click or drag a file to send its reference to the model.

Inspired by the VS Code / Cursor project tree, filling the gap of a missing directory view in DSH after workspaces are added.

## 🖥 Live Demo (GitHub Pages)

🔗 [**Try the interactive preview**](https://Jiyr0119.github.io/dsh-workspace-explorer/)

> An interactive **mock** of the panel UI — no DeepSeek Harness needed to try it. The real plugin runs inside the Harness web UI as a dynamic Cordis plugin.

![dsh-workspace-explorer demo](demo/preview.gif)

<details>
<summary><b>Screenshots</b> · 截图</summary>

![Panel](assets/screenshots/panel.png)

![File tree](assets/screenshots/tree.png)

![Insert & send](assets/screenshots/insert.png)

</details>

## Features

- 📂 **Right-side floating panel** — shows the file tree of the current workspace (session cwd); switch workspaces from the dropdown, or register any folder with `+`
- 🗂 **Lazy-loading tree** — directories load on demand; noise dirs (`node_modules`, `.git`, `dist`, `__pycache__`, …) are hidden automatically
- 🎨 **File-type icons** — filled, color-coded document badges per extension (TS / JS / Python / JSON / Markdown / image / config / shell, …); amber folders that brighten when expanded
- 🖱 **Click to insert** — click a file row to append a `[file: relative-path]` reference to the composer; after sending, the model resolves it with its `read` tool
- 🖱 **Drag & drop** — drop a file into the composer to insert at the caret (fullscreen dashed hint); dropping elsewhere appends to the end
- 🌓 **Theme-aware** — built entirely on DSH's `--dsw-alias-*` design tokens; adapts to light/dark with a native dialog look (24px radius, lv3 shadow, l3 header rule)
- 🔍 **Search & filter** — filter files by name across loaded directories (flat result list with a match count)
- 👁 **Inline preview** — peek the first 60 lines of any text file; insert the reference, or paste the full content for small files (≤ 32 KB)
- 🌐 **i18n** — zh/en dictionaries registered through DSH's locale service; the panel follows the DSH UI language

## Quick Start

### Installation

This is a **dynamic Cordis plugin** — no build step, no config changes.

1. In the DSH web UI, have an agent run `cordis_define` (or use the dynamic plugin panel) with `idPrefix` `wsex`.
2. Paste the whole [`src/host.js`](./src/host.js) into **Host code**.
3. Paste the whole [`src/client.js`](./src/client.js) into **Client code**.
4. `cordis_run` to activate; authorize on the Run card when it first appears.

**Install from npm** (source distribution): `npm install @jiyr0119/dsh-workspace-explorer` — the package ships `src/host.js` / `src/client.js` for the paste flow above, with semver releases (no native Remote wiring; see [`docs/native-package.md`](./docs/native-package.md) for the native-package roadmap).

> **Real install status**: the full interactive UI ships as a *dynamic plugin* — paste `src/host.js` + `src/client.js` per the steps above. The repo also declares a `dsh.bundle` manifest so storefronts (awesome-dsh-plugin list / dsh-market) will list it, and `dsh plugin add` / one-click storefront installs will mount the host entry cleanly — **but the browser panel will NOT appear from such an install yet**: the browser half needs a native `@Remote` bridge (upstream DSH support; see [`docs/native-package.md`](./docs/native-package.md)). Until that lands, expect a live UI only from the dynamic-plugin paste flow.

See [`docs/install.md`](./docs/install.md) for details.

### Usage

1. Click the 📁 "Files" button at the bottom of the sidebar to open the panel.
2. Expand directories to browse files.
3. Click a file, or drag it into the composer, then send.

## Project Structure

```
dsh-workspace-explorer/
├── README.md             # Docs — English (default)
├── README.zh.md          # Docs — 中文
├── LICENSE               # MIT
├── CHANGELOG.md          # Release notes
├── manifest.json         # Plugin metadata
├── package.json          # Repo metadata (not an npm package)
├── demo/
│   ├── index.html        # Interactive mock preview (GitHub Pages)
│   └── preview.gif       # Demo animation (README)
├── .github/
│   └── workflows/
│       └── pages.yml     # Deploys demo/ to GitHub Pages
├── docs/
│   ├── install.md        # Install guide
│   ├── native-package.md # Native DSH package roadmap (upstream PR sketch)
│   └── publish.md        # Publishing workflow (GitHub + npm)
└── src/
    ├── host.js           # Host half: fs listing + ws-tree.list RPC
    └── client.js         # Client half: panel + icons + drag & drop
```

## Implementation Notes

| Capability | Mechanism |
|---|---|
| Directory listing | Host `fs.resolve` / `fs.listDir` |
| Host→Client RPC | `harness.handle('ws-tree.list' / 'ws-tree.peek')` ↔ `host.call(...)` |
| Panel | `shell.overlay` slot (`useWorkspaces` / `useSessions`) |
| Toggle button | `sidebar.footer.action` slot |
| Composer write | `conversation.input.dock` → `inputActions.setDraft` |
| Drag & drop | HTML5 DnD; native caret insert in the textarea, append elsewhere |
| Theming | `--dsw-alias-*` CSS variables (light/dark) |

## Version

Current version **v0.1** — first usable release; features and visuals aligned with DSH's native UI.
See [CHANGELOG.md](./CHANGELOG.md) for release notes.

## Roadmap

**Done ✅**

- [x] v0.1 core: right-side file tree, click / drag-to-composer references, native DSH look
- [x] Search & filter; inline preview (first 60 lines); content insertion for small files (≤ 32 KB)
- [x] i18n (zh/en via the DSH locale service, follows the DSH UI language)
- [x] Demo language toggle, GitHub Pages preview, demo GIF, storefront screenshots
- [x] npm source package + `dsh.bundle` contract + awesome-dsh-plugin PR ([#1158](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/1158), pending merge)

**Track A — UX polish**

- [ ] Multi-select & batch insert file references (Shift / Cmd)
- [ ] Draggable / resizable panel that remembers position & width
- [ ] Full keyboard navigation (↑↓ to move, Enter to insert, Esc to close)
- [ ] Path actions: copy path, reveal in the OS file manager

**Track B — Productivity**

- [ ] Content search across loaded dirs (host-side grep)
- [ ] Recent files / favorites
- [ ] Paginated preview for large files (next / previous page)
- [ ] File operations (rename / delete / new, under the fs permission fence)

**Track C — Ecosystem & distribution**

- [x] npm `@jiyr0119/dsh-workspace-explorer` (v0.1.1 publishing)
- [x] awesome-dsh-plugin listing (PR #1158)
- [ ] Native DSH package (`@Remote` namespace; needs upstream support) — see [`docs/native-package.md`](./docs/native-package.md)
- [ ] dsh-genie hardened install (host-side persistence)
- [ ] CI: lint + e2e + automated release

**Track D — Quality & maintainability**

- [ ] Virtual scrolling (huge directories)
- [ ] Light / dark theme regression checks
- [ ] Playwright e2e for the demo and the real plugin

## License

[MIT](./LICENSE)
