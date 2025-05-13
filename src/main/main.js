const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// Mappa per tenere in memoria i processi avviati
const servicesMap = new Map();

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

app.whenReady().then(createWindow);

// --- IPC HANDLERS ---

// 1) dialog:open-folder (selezione cartella)
ipcMain.handle('dialog:open-folder', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return canceled ? null : filePaths[0];
});

// 2) service-start (avvio http-server)
ipcMain.handle('service-start', (event, svc) => {
  const child = spawn('npx', ['http-server', svc.folder, '-p', String(svc.port)], {
    shell: true,
    stdio: 'ignore'
  });
  servicesMap.set(child.pid, child);
  return { pid: child.pid, status: 'running' };
});

// 3) service-stop (chiusura processo)
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
  if (process.platform !== 'darwin') app.quit();
});
