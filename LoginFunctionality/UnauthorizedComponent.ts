import { Component } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  template: `
    <div class="unauthorized-container">
      <h1>Access Denied</h1>
      <p>You do not have permission to access this page.</p>
      <button (click)="goToLogin()">Go to Login</button>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      max-width: 500px;
      margin: 100px auto;
      padding: 32px;
      text-align: center;
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 8px;
      color: #721c24;
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 16px;
    }
    p {
      font-size: 1.2rem;
      margin-bottom: 24px;
    }
    button {
      padding: 12px 24px;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      &:hover { background: #c82333; }
    }
  `]
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['/login']);
  }
}