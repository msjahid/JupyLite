const { app, BrowserWindow, ipcMain, dialog, shell, Menu, nativeImage } = require('electron');
const path = require('path');
const fs   = require('fs');

let mainWindow;
let aboutWindow = null;
let pendingFile  = null;

// ─── Single Instance Lock ────────────────────────────────────
// If a second instance starts, send the file to the first instance
// and quit immediately — prevents opening a new window
const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  // Another instance is already running — quit this one
  app.quit();
} else {
  // Second instance tried to start — receive its file path
  app.on('second-instance', (event, argv) => {
    // Find .ipynb file in the new instance's argv
    const fp = argv.find(a => a && a.endsWith('.ipynb') && fs.existsSync(a));
    if (fp && mainWindow) {
      // Focus existing window and open file as new tab
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      loadNotebook(fp);
    }
  });
}

// ─── Icon ────────────────────────────────────────────────────
function getIconPath() {
  const candidates = [
    path.join(__dirname, '..', 'assets', 'JupyLite.png'),
    path.join(process.resourcesPath || '', 'assets', 'JupyLite.png'),
    path.join(app.getAppPath(), 'assets', 'JupyLite.png')
  ];
  return candidates.find(p => fs.existsSync(p)) || candidates[0];
}

// ─── Main Window ─────────────────────────────────────────────
function createWindow() {
  const iconPath  = getIconPath();
  const iconImage = fs.existsSync(iconPath)
    ? nativeImage.createFromPath(iconPath)
    : nativeImage.createEmpty();

  mainWindow = new BrowserWindow({
    width: 1280, height: 840, minWidth: 800, minHeight: 600,
    backgroundColor: '#191724',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: iconImage.isEmpty() ? iconPath : iconImage,
    show: false
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (!iconImage.isEmpty()) mainWindow.setIcon(iconImage);
  });
  buildMenu();
}

// ─── About Window ────────────────────────────────────────────
function showAbout() {
  if (aboutWindow && !aboutWindow.isDestroyed()) { aboutWindow.focus(); return; }
  aboutWindow = new BrowserWindow({
    width: 460, height: 340,
    resizable: false, minimizable: true, maximizable: false,
    show: false, backgroundColor: '#1f1d2e',
    webPreferences: { nodeIntegration: true, contextIsolation: false },
    icon: getIconPath()
  });
  aboutWindow.setMenu(null);
  aboutWindow.loadFile(path.join(__dirname, 'about.html'));
  aboutWindow.once('ready-to-show', () => aboutWindow.show());
  aboutWindow.on('closed', () => { aboutWindow = null; });
}

function buildMenu() {
  const s = (ch, ...a) => mainWindow.webContents.send(ch, ...a);
  const zoomIn  = () => { const z = mainWindow.webContents.getZoomFactor(); mainWindow.webContents.setZoomFactor(Math.min(z + 0.1, 3)); };
  const zoomOut = () => { const z = mainWindow.webContents.getZoomFactor(); mainWindow.webContents.setZoomFactor(Math.max(z - 0.1, 0.3)); };
  const zoomReset = () => mainWindow.webContents.setZoomFactor(1.0);

  const template = [
    {
      label: 'File', submenu: [
        { label: 'Open Notebook…', accelerator: 'CmdOrCtrl+O', click: () => openFileDialog() },
        { type: 'separator' },
        { label: 'Close Tab', accelerator: 'CmdOrCtrl+W', click: () => s('close-tab') },
        { type: 'separator' },
        { label: 'Quit', accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4', click: () => app.quit() }
      ]
    },
    {
      label: 'Edit', submenu: [
        { label: 'Find in Notebook', accelerator: 'CmdOrCtrl+F', click: () => s('toggle-find') },
        { type: 'separator' },
        { label: 'Font Settings…', accelerator: 'CmdOrCtrl+Shift+F', click: () => s('open-font-settings') },
        { type: 'separator' },
        { label: 'App Font Size',  submenu: [
          { label: 'Increase', accelerator: 'CmdOrCtrl+Shift+.', click: () => s('app-font', 1) },
          { label: 'Decrease', accelerator: 'CmdOrCtrl+Shift+,', click: () => s('app-font', -1) },
          { label: 'Reset', click: () => s('app-font', 0) }
        ]},
        { label: 'Code Font Size', submenu: [
          { label: 'Increase', accelerator: 'CmdOrCtrl+Alt+.', click: () => s('code-font', 1) },
          { label: 'Decrease', accelerator: 'CmdOrCtrl+Alt+,', click: () => s('code-font', -1) },
          { label: 'Reset', click: () => s('code-font', 0) }
        ]},
        { label: 'UI Font Size', submenu: [
          { label: 'Increase', click: () => s('ui-font', 1) },
          { label: 'Decrease', click: () => s('ui-font', -1) },
          { label: 'Reset', click: () => s('ui-font', 0) }
        ]}
      ]
    },
    {
      label: 'View', submenu: [
        { label: 'Theme', submenu: [
          { label: 'Rosé Pine', accelerator: 'CmdOrCtrl+Shift+1', click: () => s('set-theme', 'rose-pine') },
          { label: 'Dark',      accelerator: 'CmdOrCtrl+Shift+2', click: () => s('set-theme', 'dark') },
          { label: 'Light',     accelerator: 'CmdOrCtrl+Shift+3', click: () => s('set-theme', 'light') }
        ]},
        { type: 'separator' },
        { label: 'Zoom In',    accelerator: 'CmdOrCtrl+=',    click: zoomIn },
        { label: 'Zoom In',    accelerator: 'CmdOrCtrl+Plus', click: zoomIn, visible: false },
        { label: 'Zoom Out',   accelerator: 'CmdOrCtrl+-',    click: zoomOut },
        { label: 'Reset Zoom', accelerator: 'CmdOrCtrl+0',    click: zoomReset },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'toggleDevTools' }
      ]
    },
    {
      label: 'Help', submenu: [
        { label: 'About JupyLite', click: () => showAbout() },
        { label: 'Report an Issue', click: () => shell.openExternal('https://github.com/msjahid/jupylite/issues') }
      ]
    }
  ];

  if (process.platform === 'darwin') {
    template.unshift({ label: app.getName(), submenu: [
      { role: 'about' }, { type: 'separator' },
      { role: 'hide' }, { role: 'hideothers' }, { role: 'unhide' },
      { type: 'separator' }, { role: 'quit' }
    ]});
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

async function openFileDialog() {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Open Jupyter Notebook',
    filters: [{ name: 'Jupyter Notebooks', extensions: ['ipynb'] }, { name: 'All Files', extensions: ['*'] }],
    properties: ['openFile', 'multiSelections']
  });
  if (!result.canceled) result.filePaths.forEach(fp => loadNotebook(fp));
}

function loadNotebook(filePath) {
  try {
    const nb = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    mainWindow.webContents.send('notebook-loaded', { notebook: nb, filePath, fileName: path.basename(filePath) });
  } catch (err) {
    dialog.showErrorBox('Error', `Could not open file:\n${err.message}`);
  }
}

ipcMain.handle('open-file-dialog', () => openFileDialog());
ipcMain.handle('get-app-icon', () => {
  try {
    const p = getIconPath();
    if (fs.existsSync(p)) return 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');
  } catch(e) {}
  return null;
});
ipcMain.handle('open-external', (e, url) => shell.openExternal(url));
ipcMain.handle('get-zoom', () => mainWindow.webContents.getZoomFactor());
ipcMain.handle('set-zoom', (e, f) => mainWindow.webContents.setZoomFactor(Math.min(Math.max(f, 0.3), 3)));
ipcMain.handle('get-fonts', () => [
  'Arial','Calibri','Candara','Century Gothic','DejaVu Sans','Geneva','Gill Sans',
  'Helvetica','Liberation Sans','Noto Sans','Open Sans','Optima','Segoe UI',
  'Tahoma','Trebuchet MS','Ubuntu','Verdana',
  'Cambria','DejaVu Serif','Garamond','Georgia','Liberation Serif','Noto Serif','Palatino','Times New Roman',
  'Cascadia Code','Consolas','Courier New','DejaVu Sans Mono','Fira Code','Fira Mono',
  'Hack','Inconsolata','JetBrains Mono','Liberation Mono','Menlo','Monaco',
  'Noto Mono','Roboto Mono','Source Code Pro','Ubuntu Mono'
].sort());

ipcMain.on('close-about-win', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win && !win.isDestroyed()) win.close();
});


app.on('will-finish-launching', () => {
  app.on('open-file', (event, fp) => {
    event.preventDefault();
    if (mainWindow && !mainWindow.isDestroyed()) {
      // Window already open — load as new tab
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      loadNotebook(fp);
    } else {
      pendingFile = fp;
    }
  });
});

app.whenReady().then(() => {
  if (!gotLock) return; // already quitting

  // Find .ipynb in ALL argv entries
  const fp = process.argv.find(a => a && a.endsWith('.ipynb') && fs.existsSync(a));
  if (fp) pendingFile = fp;

  createWindow();
});

// Renderer fully ready — send pending file as new tab
ipcMain.on('renderer-ready', () => {
  if (pendingFile) {
    const fp = pendingFile;
    pendingFile = null;
    if (fs.existsSync(fp)) {
      setTimeout(() => loadNotebook(fp), 150);
    }
  }
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
