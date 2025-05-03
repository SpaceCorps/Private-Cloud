import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class FileUploadComponent {
  uploading = false;
  error: string | null = null;

  constructor(private storageService: StorageService) {}

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.uploading = true;
    this.error = null;

    try {
      for (const file of Array.from(input.files)) {
        await this.storageService.uploadFile(file);
      }
    } catch (error) {
      this.error = 'Failed to upload file(s). Please try again.';
      console.error('Upload error:', error);
    } finally {
      this.uploading = false;
      // Reset the input
      input.value = '';
    }
  }
} 