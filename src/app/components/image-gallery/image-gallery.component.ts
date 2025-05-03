import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ImageGalleryComponent {
  images: any[] = []; // TODO: Add proper image type

  constructor() {
    // TODO: Implement image listing
  }
} 