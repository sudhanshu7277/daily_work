import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  roles = ['Maker', 'Checker1', 'Checker2', 'Checker3'];

  loginForm = new FormGroup({
    role: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  hidePassword = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { role, password } = this.loginForm.value;

      this.authService.login(role!, password!).subscribe({
        next: (user) => {
          const route = this.getRouteForRole(user.role);
          this.router.navigate([route]);
        },
        error: (err) => {
          this.snackBar.open(err.message || 'Login failed', 'Close', { duration: 5000 });
        }
      });
    }
  }

  private getRouteForRole(role: string): string {
    switch (role) {
      case 'Maker': return '/maker';
      case 'Checker1': return '/checker1';
      case 'Checker2': return '/checker2';
      case 'Checker3': return '/checker3';
      default: return '/login';
    }
  }
}