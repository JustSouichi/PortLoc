const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path   = require('path');
const fs     = require('fs');
const os     = require('os');
const http   = require('http');
const serveHandler = require('serve-handler');

let store;
const servicesMap = new Map();
const socketMap   = new Map(); // mappa pid → Set di socket

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

ipcMain.handle('service-start', async (event, svc) => {
  // Crea un server HTTP che serve staticamente `svc.folder`
  const server = http.createServer((req, res) => {
    serveHandler(req, res, { public: svc.folder });
  });

  // Disattiva il keep-alive per chiusura immediata
  server.keepAliveTimeout = 0;
  server.headersTimeout   = 0;

  // Tieni traccia dei socket aperti
  const sockets = new Set();
  server.on('connection', socket => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
  });

  // Avvia il listener sulla porta
  await new Promise((res, rej) =>
    server.listen(svc.port, err => err ? rej(err) : res())
  );

  // Memorizza server e socket
  servicesMap.set(svc.id, server);
  socketMap.set(svc.id, sockets);

  return { pid: svc.id, status: 'running' };
});

ipcMain.handle('service-stop', (event, pid) => {
  const server  = servicesMap.get(pid);
  const sockets = socketMap.get(pid);

  if (server) {
    // Distruggi subito tutti i socket attivi
    if (sockets) {
      for (const sock of sockets) sock.destroy();
      socketMap.delete(pid);
    }

    server.close(err => {
      if (err) console.error(`Errore chiusura server ${pid}:`, err);
      else console.log(`Server ${pid} chiuso.`);
    });

    servicesMap.delete(pid);
    return { pid, status: 'stopped' };
  }

  return { pid, status: 'unknown' };
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


