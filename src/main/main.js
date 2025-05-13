// src/main/main.js

const { app, BrowserWindow, ipcMain, dialog, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const { icon } = require('@fortawesome/fontawesome-svg-core');
const { faHome } = require('@fortawesome/free-solid-svg-icons');

let tray = null;
let store;                       // electron-store instance
const servicesMap = new Map();   // pid → child process

// Initialize electron-store (ESM) via dynamic import
async function initStore() {
  const { default: Store } = await import('electron-store');
  store = new Store({ defaults: { services: [] } });

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
    // win.webContents.openDevTools(); // uncomment to debug
  }

  // Prevent closing: hide instead, so app stays in tray
  win.on('close', e => {
    if (process.platform !== 'darwin') {
      e.preventDefault();
      win.hide();
    }
  });

  return win;
}

app.whenReady().then(async () => {
  await initStore();
  createWindow();
  createTray();
});

// IPC: open folder picker
ipcMain.handle('dialog:open-folder', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return canceled ? null : filePaths[0];
});

// IPC: start http-server for a service
ipcMain.handle('service-start', (event, svc) => {
  const child = spawn(
    'npx',
    ['http-server', svc.folder, '-p', String(svc.port)],
    { shell: true, stdio: 'ignore' }
  );
  servicesMap.set(child.pid, child);
  return { pid: child.pid, status: 'running' };
});

// IPC: stop a running service
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
  // On macOS it's common to keep app running until explicitly quit
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

//
// Tray setup using FontAwesome SVG icon
//
function createTray() {
  // Generate SVG markup for the "home" icon
  const svgHtml = icon({ prefix: 'fas', iconName: faHome.iconName }).html[0];
  // Build a data URL
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgHtml)}`;
  // Create a nativeImage from it
  const trayImage = nativeImage.createFromDataURL(dataUrl);
  trayImage.setSize({ width: 24, height: 24 });

  tray = new Tray(trayImage);
  tray.setToolTip('PortLoc');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show PortLoc',
      click: () => {
        const win = BrowserWindow.getAllWindows()[0];
        win.show();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  // Toggle window visibility on click
  tray.on('click', () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win.isVisible()) win.hide();
    else win.show();
  });
}
