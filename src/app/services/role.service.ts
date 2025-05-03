import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private role: 'host' | 'consumer' | null = null;

  setRole(role: 'host' | 'consumer') {
    this.role = role;
  }

  getRole(): 'host' | 'consumer' | null {
    return this.role;
  }
} 