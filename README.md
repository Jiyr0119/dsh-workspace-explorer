# dsh-workspace-explorer

**[English](README.md)** | [中文](README.zh.md)

> A workspace file explorer for the DeepSeek Harness Web UI: a right-side panel showing the current workspace's directory tree — click or drag a file to send its reference to the model.

Inspired by the VS Code / Cursor project tree, filling the gap of a missing directory view in DSH after workspaces are added.

## 🖥 Live Demo (GitHub Pages)

🔗 [**Try the interactive preview**](https://Jiyr0119.github.io/dsh-workspace-explorer/)

> An interactive **mock** of the panel UI — no DeepSeek Harness needed to try it. The real plugin runs inside the Harness web UI as a dynamic Cordis plugin.

![dsh-workspace-explorer demo](demo/preview.gif)

## Features

- 📂 **Right-side floating panel** — shows the file tree of the current workspace (session cwd); switch workspaces from the dropdown, or register any folder with `+`
- 🗂 **Lazy-loading tree** — directories load on demand; noise dirs (`node_modules`, `.git`, `dist`, `__pycache__`, …) are hidden automatically
- 🎨 **File-type icons** — filled, color-coded document badges per extension (TS / JS / Python / JSON / Markdown / image / config / shell, …); amber folders that brighten when expanded
- 🖱 **Click to insert** — click a file row to append a `[file: relative-path]` reference to the composer; after sending, the model resolves it with its `read` tool
- 🖱 **Drag & drop** — drop a file into the composer to insert at the caret (fullscreen dashed hint); dropping elsewhere appends to the end
- 🌓 **Theme-aware** — built entirely on DSH's `--dsw-alias-*` design tokens; adapts to light/dark with a native dialog look (24px radius, lv3 shadow, l3 header rule)

## Quick Start

### Installation

This is a **dynamic Cordis plugin** — no build step, no config changes.

1. In the DSH web UI, have an agent run `cordis_define` (or use the dynamic plugin panel) with `idPrefix` `wsex`.
2. Paste the whole [`src/host.js`](./src/host.js) into **Host code**.
3. Paste the whole [`src/client.js`](./src/client.js) into **Client code**.
4. `cordis_run` to activate; authorize on the Run card when it first appears.

**Install from npm** (source distribution): `npm install @jiyr0119/dsh-workspace-explorer` — the package ships `src/host.js` / `src/client.js` for the paste flow above, with semver releases (no native Remote wiring; see [`docs/native-package.md`](./docs/native-package.md) for the native-package roadmap).

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
| Host→Client RPC | `harness.handle('ws-tree.list')` ↔ `host.call(...)` |
| Panel | `shell.overlay` slot (`useWorkspaces` / `useSessions`) |
| Toggle button | `sidebar.footer.action` slot |
| Composer write | `conversation.input.dock` → `inputActions.setDraft` |
| Drag & drop | HTML5 DnD; native caret insert in the textarea, append elsewhere |
| Theming | `--dsw-alias-*` CSS variables (light/dark) |

## Version

Current version **v0.1** — first usable release; features and visuals aligned with DSH's native UI.
See [CHANGELOG.md](./CHANGELOG.md) for release notes.

## Roadmap

- [ ] Optional inline content for small files (ChatGPT-style upload)
- [ ] Filename search & filter
- [ ] File preview (first N lines)
- [ ] Native DSH package (`@Remote` namespace) — see [`docs/install.md`](./docs/install.md)

## License

[MIT](./LICENSE)
