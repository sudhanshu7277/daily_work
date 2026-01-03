import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-checker3',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Checker3 Dashboard</h2>
    <p>Welcome, Checker3! You can only see this screen.</p>
    <button (click)="logout()">Logout</button>
  `
})
export class Checker3Component {
  constructor(private loginService: LoginService) {}

  logout() {
    this.loginService.logout();
  }
}