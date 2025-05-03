import { Component } from '@angular/core';
import { FileListComponent } from '../components/file-list/file-list.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-host-page',
  template: `
    <h2>Host Dashboard</h2>
    <label>
      <input type="checkbox" [(ngModel)]="hostingEnabled"> This PC is a host
    </label>
    <div *ngIf="hostingEnabled">
      <app-file-list></app-file-list>
    </div>
    <div *ngIf="!hostingEnabled" style="margin-top:2rem;">
      <em>Hosting is disabled. Enable to share files on this PC.</em>
    </div>
  `,
  standalone: true,
  imports: [FileListComponent, FormsModule, CommonModule]
})
export class HostPageComponent {
  hostingEnabled = true;
} 