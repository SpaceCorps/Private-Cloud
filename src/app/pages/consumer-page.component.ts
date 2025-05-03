import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkService, HostInfo } from '../services/network.service';

@Component({
  selector: 'app-consumer-page',
  template: `
    <h2>Consumer Dashboard</h2>
    <div>
      <h3>Available Hosts</h3>
      <ul>
        <li *ngFor="let host of hosts">
          <span [style.color]="host.online ? 'green' : 'red'">
            ●
          </span>
          <span>{{ host.name }} ({{ host.address }}:{{ host.port }})</span>
          <button (click)="connectToHost(host)" [disabled]="!host.online">Connect</button>
        </li>
      </ul>
      <div *ngIf="hosts.length === 0">
        <em>No hosts found on the network.</em>
      </div>
    </div>
    <div *ngIf="connectedHost as host">
      <h4>Connected to: {{ host.name }}</h4>
      <input type="file" (change)="onFileSelected($event)">
      <button (click)="refreshFiles()">Refresh Files</button>
      <ul>
        <li *ngFor="let file of remoteFiles">
          {{ file.name }} ({{ file.size }} bytes)
          <button (click)="downloadFile(file)">Download</button>
        </li>
      </ul>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class ConsumerPageComponent implements OnInit {
  hosts: HostInfo[] = [];
  connectedHost: HostInfo | null = null;
  remoteFiles: any[] = [];

  constructor(private networkService: NetworkService) {}

  ngOnInit() {
    this.networkService.subscribeHosts((hosts) => {
      this.hosts = hosts;
    });
  }

  async connectToHost(host: HostInfo) {
    this.connectedHost = host;
    await this.refreshFiles();
  }

  async refreshFiles() {
    if (this.connectedHost) {
      this.remoteFiles = await this.networkService.listFiles(this.connectedHost);
    }
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.connectedHost) return;
    for (const file of Array.from(input.files)) {
      await this.networkService.uploadFile(this.connectedHost, file);
    }
    await this.refreshFiles();
    input.value = '';
  }

  async downloadFile(file: any) {
    if (!this.connectedHost) return;
    const blob = await this.networkService.downloadFile(this.connectedHost, file.id);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    window.URL.revokeObjectURL(url);
  }
} 