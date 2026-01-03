import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  roles = ['Maker', 'Checker1', 'Checker2', 'Checker3'];

  loginForm = new FormGroup({
    role: new FormControl<string>('', [Validators.required]),
    password: new FormControl<string>('', [Validators.required])
  });

  hidePassword = true;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onSubmit(): void {
    if (this.loginForm.invalid || this.loading) {
      return;
    }

    this.loading = true;
    const { role, password } = this.loginForm.value;

    this.authService.login(role!, password!).subscribe({
      next: () => {
        // Navigate to the main PPA entry point
        // AuthRedirectGuard will handle role-based tab redirection
        this.router.navigate(['/ppa-entry']);
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(
          err.message || 'Invalid role or password',
          'Close',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}