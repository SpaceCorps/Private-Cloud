import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

declare global {
  interface Window {
    electronAPI: {
      getFiles: () => Promise<any[]>;
      getStorageInfo: () => Promise<any>;
      uploadFile: (filePath: string) => Promise<void>;
      downloadFile: (fileId: string) => Promise<void>;
    }
  }
}

export interface StorageInfo {
  total: number;
  free: number;
  used: number;
}

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
  uploadDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private filesSubject = new BehaviorSubject<FileInfo[]>([]);
  private storageInfoSubject = new BehaviorSubject<StorageInfo>({ total: 0, free: 0, used: 0 });

  constructor() {
    this.loadFiles();
    this.updateStorageInfo();
    // Update storage info every minute
    setInterval(() => this.updateStorageInfo(), 60000);
  }

  get files$(): Observable<FileInfo[]> {
    return this.filesSubject.asObservable();
  }

  get storageInfo$(): Observable<StorageInfo> {
    return this.storageInfoSubject.asObservable();
  }

  private async loadFiles() {
    try {
      const files = await window.electronAPI.getFiles();
      this.filesSubject.next(files);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  }

  private async updateStorageInfo() {
    try {
      const info = await window.electronAPI.getStorageInfo();
      this.storageInfoSubject.next(info);
    } catch (error) {
      console.error('Error updating storage info:', error);
    }
  }

  async uploadFile(file: File): Promise<void> {
    try {
      await window.electronAPI.uploadFile(file.path);
      await this.loadFiles();
      await this.updateStorageInfo();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async downloadFile(fileId: string): Promise<void> {
    try {
      await window.electronAPI.downloadFile(fileId);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }
} 