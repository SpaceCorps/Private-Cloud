import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import type { Request, Response } from 'express';
import * as os from 'os';
import * as drivelist from 'drivelist';

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const bonjour = require('bonjour');

const STORAGE_DIR = path.join(app.getPath('userData'), 'storage');
const FILE_SERVER_PORT = 3030;
const SERVICE_TYPE = 'privatecloud';

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// --- Express File Server ---
const fileApp = express();
fileApp.use(cors());
const upload = multer({ dest: STORAGE_DIR });

fileApp.get('/files', (req: Request, res: Response) => {
  const files = fs.readdirSync(STORAGE_DIR).map((filename: string) => {
    const filePath = path.join(STORAGE_DIR, filename);
    const stats = fs.statSync(filePath);
    return {
      id: filename,
      name: filename,
      size: stats.size,
      type: path.extname(filename).slice(1),
      uploadDate: stats.mtime
    };
  });
  res.json(files);
});

fileApp.get('/files/:id', (req: Request, res: Response) => {
  const filePath = path.join(STORAGE_DIR, req.params['id']);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

fileApp.post('/upload', upload.single('file'), (req: Request, res: Response) => {
  // Rename file to original name if not taken
  const tempPath = req.file!.path;
  let destPath = path.join(STORAGE_DIR, req.file!.originalname);
  if (fs.existsSync(destPath)) {
    const ext = path.extname(req.file!.originalname);
    const baseName = path.basename(req.file!.originalname, ext);
    destPath = path.join(STORAGE_DIR, `${baseName}_${uuidv4()}${ext}`);
  }
  fs.renameSync(tempPath, destPath);
  res.json({ success: true });
});

fileApp.listen(FILE_SERVER_PORT, () => {
  console.log(`File server running on port ${FILE_SERVER_PORT}`);
});

// --- Bonjour Advertisement ---
const bonjourService = bonjour();
const hostname = os.hostname();
bonjourService.publish({
  name: `PrivateCloud-${hostname}`,
  type: SERVICE_TYPE,
  port: FILE_SERVER_PORT,
  txt: { host: hostname }
});

// --- Bonjour Discovery ---
let discoveredHosts: any[] = [];
bonjourService.find({ type: SERVICE_TYPE }, (service: any) => {
  const address = service.addresses.find((addr: string) => addr.includes('.'));
  const host = {
    name: service.name,
    address,
    port: service.port,
    online: true
  };
  // Update or add host
  const idx = discoveredHosts.findIndex(h => h.address === host.address && h.port === host.port);
  if (idx === -1) {
    discoveredHosts.push(host);
  } else {
    discoveredHosts[idx] = { ...discoveredHosts[idx], ...host };
  }
});

ipcMain.handle('getDiscoveredHosts', async () => {
  return discoveredHosts;
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // In development, load from Angular dev server
  if (process.env['NODE_ENV'] === 'development') {
    mainWindow.loadURL('http://localhost:4200');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built files
    mainWindow.loadFile(path.join(__dirname, '../../dist/private-cloud/browser/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Get storage information
ipcMain.handle('get-storage-info', async () => {
  const drive = path.parse(STORAGE_DIR).root;
  const stats = fs.statfsSync(drive);
  
  const total = stats.blocks * stats.bsize;
  const free = stats.bfree * stats.bsize;
  const used = total - free;

  return {
    total,
    free,
    used
  };
});

// Get list of files
ipcMain.handle('get-files', async () => {
  const files = fs.readdirSync(STORAGE_DIR);
  return files.map(filename => {
    const filePath = path.join(STORAGE_DIR, filename);
    const stats = fs.statSync(filePath);
    return {
      id: filename,
      name: filename,
      size: stats.size,
      type: path.extname(filename).slice(1),
      path: filePath,
      uploadDate: stats.mtime
    };
  });
});

// Upload file
ipcMain.handle('upload-file', async (event: any, sourcePath: string) => {
  const filename = path.basename(sourcePath);
  const destPath = path.join(STORAGE_DIR, filename);
  
  // Check if file already exists
  if (fs.existsSync(destPath)) {
    const ext = path.extname(filename);
    const baseName = path.basename(filename, ext);
    const newFilename = `${baseName}_${uuidv4()}${ext}`;
    fs.copyFileSync(sourcePath, path.join(STORAGE_DIR, newFilename));
  } else {
    fs.copyFileSync(sourcePath, destPath);
  }
});

// Download file
ipcMain.handle('download-file', async (event: any, fileId: string) => {
  const sourcePath = path.join(STORAGE_DIR, fileId);
  const { filePath } = await dialog.showSaveDialog({
    defaultPath: fileId
  });

  if (filePath) {
    fs.copyFileSync(sourcePath, filePath);
  }
});

ipcMain.handle('list-drives', async () => {
  const drives = await drivelist.list();
  return drives.map(drive => ({
    device: drive.device,
    description: drive.description,
    size: drive.size,
    mountpoints: drive.mountpoints,
    isSystem: drive.isSystem,
    isRemovable: drive.isRemovable || drive.isCard || drive.isUSB
  }));
}); 