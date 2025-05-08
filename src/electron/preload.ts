import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getFiles: () => ipcRenderer.invoke('get-files'),
  getStorageInfo: () => ipcRenderer.invoke('get-storage-info'),
  uploadFile: (filePath: string) => ipcRenderer.invoke('upload-file', filePath),
  downloadFile: (fileId: string) => ipcRenderer.invoke('download-file', fileId),
  getDiscoveredHosts: () => ipcRenderer.invoke('getDiscoveredHosts'),
  listDrives: () => ipcRenderer.invoke('list-drives')
}); 