import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RoleService } from '../../services/auth/role.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  role: string = '';
  soeid: string = '';
  error: string = '';

  constructor(private roleService: RoleService, private router: Router) {}

  login() {
    if (!this.role || !this.soeid) {
      this.error = 'Please enter role and SOEID.';
      return;
    }

    // Dummy mapping based on your conditions (replace with real auth logic)
    let allowedScreens: string[] = [];
    switch (this.soeid) {
      case 'ss71872':
        allowedScreens = ['Input', 'Checker1'];
        break;
      case 'sj81534':
        allowedScreens = ['Checker1'];
        break;
      case 'vj97973':
        allowedScreens = ['Checker2'];
        break;
      case 'vs21245':
        allowedScreens = ['Checker3'];
        break;
      default:
        this.error = 'Invalid SOEID.';
        return;
    }

    this.roleService.setUser({
      role: this.role,
      soeid: this.soeid,
      allowedScreens
    });

    this.router.navigate(['/ppa-entry/input']);
  }
}