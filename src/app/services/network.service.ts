import { Injectable } from '@angular/core';

export interface HostInfo {
  name: string;
  address: string;
  port: number;
  online?: boolean;
}

@Injectable({ providedIn: 'root' })
export class NetworkService {
  private hosts: HostInfo[] = [];
  private listeners: ((hosts: HostInfo[]) => void)[] = [];
  private polling = false;

  constructor() {}

  subscribeHosts(listener: (hosts: HostInfo[]) => void) {
    this.listeners.push(listener);
    if (!this.polling) {
      this.polling = true;
      this.pollHosts();
    }
  }

  private async pollHosts() {
    while (true) {
      try {
        // @ts-ignore
        const hosts = await window.electronAPI.getDiscoveredHosts();
        this.hosts = hosts;
        this.listeners.forEach(l => l(this.hosts));
      } catch {}
      await new Promise(res => setTimeout(res, 5000));
    }
  }

  async listFiles(host: HostInfo): Promise<any[]> {
    const res = await fetch(`http://${host.address}:${host.port}/files`);
    return res.json();
  }

  async downloadFile(host: HostInfo, fileId: string): Promise<Blob> {
    const res = await fetch(`http://${host.address}:${host.port}/files/${fileId}`);
    return res.blob();
  }

  async uploadFile(host: HostInfo, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    await fetch(`http://${host.address}:${host.port}/upload`, {
      method: 'POST',
      body: formData
    });
  }
} 