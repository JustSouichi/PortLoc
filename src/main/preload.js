const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // già esistente
  send: (channel, data) => ipcRenderer.invoke(channel, data),
  receive: (channel, fn) => ipcRenderer.on(channel, (e, ...args) => fn(...args)),

  // nuove chiamate
  startService: (svc) => ipcRenderer.invoke('service-start', svc),
  stopService: (pid) => ipcRenderer.invoke('service-stop', pid)
});
