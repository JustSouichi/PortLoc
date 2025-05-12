const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
  send: (chan, data) => ipcRenderer.invoke(chan, data),
  receive: (chan, fn) => ipcRenderer.on(chan, (e, ...args) => fn(...args))
});