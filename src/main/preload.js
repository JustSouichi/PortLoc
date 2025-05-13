const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => ipcRenderer.invoke(channel, data),
  receive: (channel, fn) => ipcRenderer.on(channel, (e, ...args) => fn(...args))
});