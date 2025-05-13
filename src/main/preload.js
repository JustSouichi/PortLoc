const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // già esistenti…
  send: (ch, data) => ipcRenderer.invoke(ch, data),
  receive: (ch, fn) => ipcRenderer.on(ch, (e, ...args) => fn(...args)),
  loadServices: () => ipcRenderer.invoke('services-load'),
  saveServices: services => ipcRenderer.invoke('services-save', services),
  startService: svc => ipcRenderer.invoke('service-start', svc),
  stopService: pid => ipcRenderer.invoke('service-stop', pid),

  // nuove API:
  getLocalIp: () => ipcRenderer.invoke('get-local-ip'),
  openExternal: url => shell.openExternal(url)
});
