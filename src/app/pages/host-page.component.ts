import { Component } from '@angular/core';
import { FileListComponent } from '../components/file-list/file-list.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-host-page',
  templateUrl: './host-page.component.html',
  styleUrls: ['./host-page.component.scss'],
  standalone: true,
  imports: [FileListComponent, FormsModule, CommonModule]
})
export class HostPageComponent {
  hostingEnabled = true;
  drives: any[] = [];
  networkStorage: { [device: string]: { enabled: boolean, allocated: number } } = {};

  async ngOnInit() {
    this.drives = await (window as any).electronAPI.listDrives();
    // Initialize networkStorage state for each drive
    for (const drive of this.drives) {
      if (!this.networkStorage[drive.device]) {
        this.networkStorage[drive.device] = { enabled: false, allocated: 0 };
      }
    }
  }

  getMountpoints(drive: any): string {
    return (drive.mountpoints || []).map((mp: any) => mp.path).join(', ');
  }

  onEnableDrive(device: string, enabled: boolean) {
    this.networkStorage[device].enabled = enabled;
    if (!enabled) {
      this.networkStorage[device].allocated = 0;
    }
  }

  onAllocateChange(device: string, value: number) {
    this.networkStorage[device].allocated = value;
  }

  getAllocatedDrives() {
    return this.drives.filter(d => this.networkStorage[d.device]?.enabled && this.networkStorage[d.device]?.allocated > 0);
  }
} 