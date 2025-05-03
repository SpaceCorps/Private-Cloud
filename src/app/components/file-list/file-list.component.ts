import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { StorageService, FileInfo, StorageInfo } from '../../services/storage.service';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss'],
  standalone: true,
  imports: [CommonModule, FileUploadComponent]
})
export class FileListComponent implements OnInit {
  files: FileInfo[] = [];
  storageInfo: StorageInfo = { total: 0, free: 0, used: 0 };

  constructor(private storageService: StorageService) {}

  ngOnInit() {
    this.storageService.files$.subscribe(files => {
      this.files = files;
    });

    this.storageService.storageInfo$.subscribe(info => {
      this.storageInfo = info;
    });
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async downloadFile(file: FileInfo) {
    try {
      await this.storageService.downloadFile(file.id);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  }
} 