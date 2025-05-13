const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let store;                  // Will hold our Electron Store instance
const servicesMap = new Map();  // Track child processes by PID

async function initStore() {
  // Dynamically import the ESM-only module
  const { default: Store } = await import('electron-store');
  store = new Store({ defaults: { services: [] } });

  // Register IPC handlers for persistence
  ipcMain.handle('services-load', () => {
    return store.get('services');
  });

  ipcMain.handle('services-save', (event, services) => {
    store.set('services', services);
    return true;
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, '../../dist/renderer/index.html'));
  } else {
    win.loadURL('http://localhost:5173');
  }
}

app.whenReady().then(async () => {
  await initStore();    // Initialize store before anything else
  createWindow();
});

// IPC: open folder picker
ipcMain.handle('dialog:open-folder', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return canceled ? null : filePaths[0];
});

// IPC: start a local HTTP server
ipcMain.handle('service-start', (event, svc) => {
  // svc = { id, title, folder, port }
  const child = spawn('npx', ['http-server', svc.folder, '-p', String(svc.port)], {
    shell: true,
    stdio: 'ignore'
  });
  servicesMap.set(child.pid, child);
  return { pid: child.pid, status: 'running' };
});

// IPC: stop a running server
ipcMain.handle('service-stop', (event, pid) => {
  const child = servicesMap.get(pid);
  if (child) {
    child.kill();
    servicesMap.delete(pid);
    return { pid, status: 'stopped' };
  }
  return { pid, status: 'unknown' };
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
