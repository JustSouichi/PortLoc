const { contextBridge, ipcRenderer } = require('electron');

console.log('🛠 preload.js loaded');

contextBridge.exposeInMainWorld('api', {
  send:        (ch, data) => ipcRenderer.invoke(ch, data),
  receive:     (ch, fn)   => ipcRenderer.on(ch, (e, ...args) => fn(...args)),
  loadServices:()          => ipcRenderer.invoke('services-load'),
  saveServices: s          => ipcRenderer.invoke('services-save', s),
  startService: svc        => ipcRenderer.invoke('service-start', svc),
  stopService: (id) => ipcRenderer.invoke('service-stop', id),
  getLocalIp:   ()         => ipcRenderer.invoke('get-local-ip'),
  openUrl:      url        => ipcRenderer.invoke('open-url', url)
});
