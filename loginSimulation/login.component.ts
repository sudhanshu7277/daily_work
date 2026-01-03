import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.loginForm.invalid || this.loading) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    const { role, password } = this.loginForm.value;

    this.authService.login(role!, password!).subscribe({
      next: () => {
        this.router.navigate(['/ppa-entry']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Invalid role or password';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}