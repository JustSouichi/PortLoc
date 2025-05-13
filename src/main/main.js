const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

let store;                    // verrà inizializzato in initStore()
const servicesMap = new Map(); // mappa pid → processo child

// 1) Inizializza electron-store via dynamic import
async function initStore() {
  const { default: Store } = await import('electron-store');
  store = new Store({ defaults: { services: [] } });
}

// 2) Crea la finestra principale
function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, '../../dist/renderer/index.html'));
  } else {
    win.loadURL('http://localhost:5173');
  }

  return win;
}

// 3) Al ready, init store e crea la finestra
app.whenReady().then(async () => {
  await initStore();
  createWindow();
});

// ——— IPC HANDLERS ———

// Persistenza servizi
ipcMain.handle('services-load', () => store.get('services'));
ipcMain.handle('services-save', (evt, services) => {
  store.set('services', services);
  return true;
});

// Dialog selezione cartella
ipcMain.handle('dialog:open-folder', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return canceled ? null : filePaths[0];
});

// Avvio HTTP-server
ipcMain.handle('service-start', (evt, svc) => {
  const child = spawn('npx', ['http-server', svc.folder, '-p', String(svc.port)], {
    shell: true,
    stdio: 'ignore'
  });
  servicesMap.set(child.pid, child);
  return { pid: child.pid, status: 'running' };
});

// Stop HTTP-server
ipcMain.handle('service-stop', (evt, pid) => {
  const child = servicesMap.get(pid);
  if (child) {
    child.kill();
    servicesMap.delete(pid);
    return { pid, status: 'stopped' };
  }
  return { pid, status: 'unknown' };
});

// Recupera IP di rete locale
ipcMain.handle('get-local-ip', () => {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
});

// Apri URL nel browser di default
ipcMain.handle('open-url', (evt, url) => {
  shell.openExternal(url);
  return true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
