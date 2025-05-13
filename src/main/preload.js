const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => ipcRenderer.invoke(channel, data),
  receive: (channel, fn) => ipcRenderer.on(channel, (e, ...args) => fn(...args)),
  loadServices: () => ipcRenderer.invoke('services-load'),
  saveServices: services => ipcRenderer.invoke('services-save', services),
  startService: svc => ipcRenderer.invoke('service-start', svc),
  stopService: pid => ipcRenderer.invoke('service-stop', pid)
});
