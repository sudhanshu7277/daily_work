import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="vh-100 d-flex justify-content-center align-items-center bg-light">
      <div class="card shadow-sm border-0" style="width: 400px;">
        <div class="card-header text-center bg-white border-0 pt-4 pb-0">
          <h3 class="text-primary fw-bold" style="color: #0b2265 !important;">GAB Platform</h3>
          <p class="text-muted">Global Account Bank Authorization</p>
        </div>
        <div class="card-body p-4">
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
            <div class="mb-3">
              <label class="form-label">Corporate ID</label>
              <input type="text" class="form-control" formControlName="username" placeholder="Enter ID">
            </div>
            <div class="mb-4">
              <label class="form-label">Password</label>
              <input type="password" class="form-control" formControlName="password" placeholder="••••••••">
            </div>
            <button type="submit" class="btn btn-primary w-100 rounded-pill" [disabled]="loginForm.invalid">
              Secure Login
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  onLogin() {
    if (this.loginForm.valid) {
      // In reality, dispatch an NgRx Auth Action here. 
      // For now, bypass straight to the dashboard.
      this.router.navigate(['/dashboard']);
    }
  }
}