import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-role-selector',
  templateUrl: './role-selector.component.html',
  styleUrls: ['./role-selector.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class RoleSelectorComponent {
  constructor(private router: Router, private roleService: RoleService) {}

  selectRole(role: 'host' | 'consumer') {
    this.roleService.setRole(role);
    this.router.navigate([`/${role}`]);
  }
} 