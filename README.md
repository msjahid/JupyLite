<div align="center">

<img src="assets/JupyLite.png" width="120" height="120" style="border-radius: 20px;" alt="JupyLite Logo"/>

# JupyLite

**A beautiful, lightweight Jupyter Notebook viewer — built with Electron**

[![License: MIT](https://img.shields.io/badge/License-MIT-c4a7e7.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-9ccfd8.svg)](https://github.com/msjahid/jupylite/releases)
[![Version](https://img.shields.io/badge/version-1.0.0-eb6f92.svg)](https://github.com/msjahid/jupylite/releases)
[![Electron](https://img.shields.io/badge/Electron-28-47848F.svg)](https://electronjs.org)

[Download](#-download) • [Features](#-features) • [Screenshots](#-screenshots) • [Installation](#-installation) • [Build](#-build-from-source) • [Shortcuts](#-keyboard-shortcuts)

</div>

---

## ✨ Features

- 📓 **Full notebook rendering** — code cells, markdown, raw cells, and all output types
- 🎨 **3 beautiful themes** — Rosé Pine (dark), Dark, and Light — switch instantly
- 🔍 **Find in notebook** — real-time search with highlighted matches (`Ctrl+F`)
- 📑 **Multi-tab support** — open multiple notebooks as tabs in one window
- 🖱️ **Drag & drop** — drag any `.ipynb` file directly onto the window
- 🖼️ **Rich outputs** — images (PNG/JPEG/SVG), DataFrames, HTML tables, plots
- 🔢 **Math rendering** — KaTeX for inline `$...$` and block `$$...$$` equations
- 💻 **Syntax highlighting** — highlight.js for all programming languages
- 📋 **Copy button** — hover any code cell to copy source instantly
- 📚 **Table of Contents** — auto-generated from markdown headings with scroll-to
- 🔤 **Font settings** — customize app font, code font, and UI font size independently
- 🔎 **Zoom** — `Ctrl+scroll` or menu zoom, persisted between sessions
- ↔️ **Resizable sidebar** — drag to resize the TOC panel to your preference
- 🖥️ **Cross-platform** — Windows, Linux, macOS from a single codebase
- 📂 **File association** — double-click any `.ipynb` to open directly in JupyLite

---

## 📥 Download

Get the latest release for your platform:

| Platform | Format | Download |
|----------|--------|----------|
| 🐧 Linux | `.AppImage` | [JupyLite-1.0.0.AppImage](https://github.com/msjahid/jupylite/releases) |
| 🐧 Linux | `.deb` (Ubuntu/Debian/Kali) | [jupylite_1.0.0_amd64.deb](https://github.com/msjahid/jupylite/releases) |
| 🐧 Linux | `.rpm` (Fedora/RHEL) | [jupylite-1.0.0.x86_64.rpm](https://github.com/msjahid/jupylite/releases) |
| 🐧 Linux | `.pacman` (Arch/Manjaro) | [jupylite-1.0.0.pacman](https://github.com/msjahid/jupylite/releases) |
| 🐧 Linux | `.snap` | [jupylite_1.0.0_amd64.snap](https://github.com/msjahid/jupylite/releases) |
| 🪟 Windows | `.exe` installer | [JupyLite Setup 1.0.0.exe](https://github.com/msjahid/jupylite/releases) |
| 🪟 Windows | `.msi` | [JupyLite 1.0.0.msi](https://github.com/msjahid/jupylite/releases) |
| 🍎 macOS | `.dmg` | [JupyLite-1.0.0.dmg](https://github.com/msjahid/jupylite/releases) |

---

## 🚀 Installation

### Linux — AppImage (no install needed)
```bash
chmod +x JupyLite-1.0.0.AppImage
./JupyLite-1.0.0.AppImage
```

### Linux — Debian/Ubuntu/Kali (.deb)
```bash
sudo dpkg -i jupylite_1.0.0_amd64.deb
```

### Linux — Fedora/RHEL (.rpm)
```bash
sudo dnf install jupylite-1.0.0.x86_64.rpm
```

### Linux — Arch/Manjaro (.pacman)
```bash
sudo pacman -U jupylite-1.0.0.pacman
```

### Windows
Run `JupyLite Setup 1.0.0.exe` and follow the installer.

### macOS
Open `JupyLite-1.0.0.dmg` and drag JupyLite to Applications.

---

## 📂 Open with JupyLite

### From terminal
```bash
jupylite /path/to/notebook.ipynb
```

### Set as default app for .ipynb (Linux)
```bash
bash install-icon-dev.sh
```

This registers JupyLite as the default opener for `.ipynb` files so you can double-click them from your file manager.

---

## 🛠️ Build from Source

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or later
- npm

### Setup
```bash
git clone https://github.com/msjahid/jupylite.git
cd jupylite
npm install
```

### Run in development
```bash
npm start
```

### Build for Linux
```bash
npm run build:linux
```

Outputs in `dist/`:
```
dist/
├── JupyLite-1.0.0.AppImage
├── jupylite_1.0.0_amd64.deb
├── jupylite_1.0.0_amd64.snap
├── jupylite-1.0.0.tar.gz
└── jupylite-1.0.0.pacman
```

### Build for Windows (requires Wine on Linux)
```bash
npm run build:win
```

Outputs:
```
dist/
├── JupyLite Setup 1.0.0.exe
└── JupyLite 1.0.0.msi
```

### Build for macOS
```bash
npm run build:mac
```

### Build all platforms
```bash
npm run build:all
```

---

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open Notebook | `Ctrl+O` |
| Close Tab | `Ctrl+W` |
| Find in Notebook | `Ctrl+F` |
| Find Next | `Enter` |
| Find Previous | `Shift+Enter` |
| Font Settings | `Ctrl+Shift+F` |
| Zoom In | `Ctrl+=` or `Ctrl+Scroll Up` |
| Zoom Out | `Ctrl+-` or `Ctrl+Scroll Down` |
| Reset Zoom | `Ctrl+0` |
| Theme: Rosé Pine | `Ctrl+Shift+1` |
| Theme: Dark | `Ctrl+Shift+2` |
| Theme: Light | `Ctrl+Shift+3` |
| Toggle Fullscreen | `F11` |
| Reload | `Ctrl+R` |
| DevTools | `Ctrl+Shift+I` |

---

## 📁 Project Structure

```
jupylite/
├── src/
│   ├── main.js          # Electron main process
│   ├── preload.js       # Secure IPC bridge
│   ├── index.html       # App shell
│   ├── styles.css       # Themes & styles
│   ├── renderer.js      # Notebook parser & renderer
│   └── about.html       # About dialog
├── assets/
│   ├── JupyLite.png     # App icon
│   └── jupyter-logo.png # .ipynb file icon
├── install-icon-dev.sh  # Linux file association setup
├── package.json
└── README.md
```

---

## 🎨 Themes

JupyLite ships with three themes — switch via the sidebar dots or `View → Theme`:

| Theme | Description |
|-------|-------------|
| 🌸 **Rosé Pine** | Warm dark theme with purple/pink accents (default) |
| 🌑 **Dark** | GitHub-style dark theme with blue accents |
| ☀️ **Light** | Clean light theme for daytime use |

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create your branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 👨‍💻 Author

**Jahid Hasan** (msjahid)

- 🌐 Website: [https://msjahid.me](https://msjahid.me)
- 🐙 GitHub: [@msjahid](https://github.com/msjahid)
- 💼 LinkedIn: [linkedin.com/in/msjahid](https://linkedin.com/in/msjahid)

---

<div align="center">

Made with ❤️ by [Jahid Hasan](https://msjahid.me)

⭐ If you find JupyLite useful, please give it a star!

</div>
