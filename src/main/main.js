// src/main/main.js

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path   = require('path');
const fs     = require('fs');
const { spawn } = require('child_process');
const os     = require('os');
const { createServer } = require('http-server');

let store;
const servicesMap = new Map();

// 1) init electron-store dinamico
async function initStore() {
  const { default: Store } = await import('electron-store');
  store = new Store({ defaults: { services: [] } });
}

// 2) crea window
function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  // path al build React
  const indexHtml = path.join(__dirname, '../../dist/renderer/index.html');
  if (app.isPackaged || fs.existsSync(indexHtml)) {
    console.log('▶️ Loading prod index.html from:', indexHtml);
    win.loadFile(indexHtml);
  } else {
    console.log('▶️ Dev mode, loading http://localhost:5173');
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  }

  return win;
}

app.whenReady().then(async () => {
  await initStore();
  createWindow();
});

// ——— IPC HANDLERS ———
ipcMain.handle('services-load',    ()   => store.get('services'));
ipcMain.handle('services-save',    (e, s) => { store.set('services', s); return true; });
ipcMain.handle('dialog:open-folder', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  return canceled ? null : filePaths[0];
});
// service-start: restituisco { id, status }
ipcMain.handle('service-start', async (_, svc) => {
  const server = createServer({ root: svc.folder, silent: true });
  await new Promise(r => server.listen(svc.port, r));
  servicesMap.set(svc.id, server);
  return { id: svc.id, status: 'running' };
});

// main.js

ipcMain.handle('service-stop', async (_, id) => {
  // assicuriamoci che la chiave sia un numero
  const key = typeof id === 'string' ? parseInt(id, 10) : id;
  const server = servicesMap.get(key);

  if (server) {
    // avvolgiamo close() in una Promise per attendere la chiusura
    await new Promise(resolve => {
      server.close(() => {
        servicesMap.delete(key);
        console.log(`✅ Server ${key} chiuso correttamente`);
        resolve();
      });
    });

    return { id: key, status: 'stopped' };
  } else {
    console.warn(`⚠️ Nessun server trovato con id ${key}`);
    return { id: key, status: 'unknown' };
  }
});


ipcMain.handle('get-local-ip', () => {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
});
ipcMain.handle('open-url', (e, url) => {
  shell.openExternal(url);
  return true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
