const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: ()    => ipcRenderer.invoke('open-file-dialog'),
  openExternal:  (url)  => ipcRenderer.invoke('open-external', url),
  setZoom: (f)          => ipcRenderer.invoke('set-zoom', f),
  getZoom: ()           => ipcRenderer.invoke('get-zoom'),
  getFonts:   ()        => ipcRenderer.invoke('get-fonts'),
  getAppIcon: ()        => ipcRenderer.invoke('get-app-icon'),
  // Signal to main that renderer is fully ready to receive notebooks
  rendererReady: ()     => ipcRenderer.send('renderer-ready'),

  onNotebookLoaded:  (cb) => ipcRenderer.on('notebook-loaded',   (_, d) => cb(d)),
  onSetTheme:        (cb) => ipcRenderer.on('set-theme',         (_, t) => cb(t)),
  onCloseTab:        (cb) => ipcRenderer.on('close-tab',         ()     => cb()),
  onOpenFontSettings:(cb) => ipcRenderer.on('open-font-settings',()     => cb()),
  onToggleFind:      (cb) => ipcRenderer.on('toggle-find',       ()     => cb()),
  onAppFont:         (cb) => ipcRenderer.on('app-font',          (_, v) => cb(v)),
  onCodeFont:        (cb) => ipcRenderer.on('code-font',         (_, v) => cb(v)),
  onUiFont:          (cb) => ipcRenderer.on('ui-font',           (_, v) => cb(v))
});
