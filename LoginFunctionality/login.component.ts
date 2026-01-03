import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  template: `
    <div class="login-container">
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form" novalidate>
        <h2 class="title">Login</h2>

        <div class="form-group">
          <label for="role">Role</label>
          <select id="role" formControlName="role" class="form-control">
            <option value="" disabled selected>Select a role</option>
            <option value="Maker">Maker</option>
            <option value="Checker1">Checker1</option>
            <option value="Checker2">Checker2</option>
            <option value="Checker3">Checker3</option>
          </select>
        </div>

        <div class="form-group password-group">
          <label for="password">Password</label>
          <input 
            [type]="passwordFieldType" 
            id="password" 
            formControlName="password" 
            class="form-control"
            autocomplete="current-password"
          />
          <button type="button" class="show-hide-btn" (click)="togglePassword()" tabindex="-1">
            {{ passwordFieldType === 'password' ? 'Show' : 'Hide' }}
          </button>
        </div>

        <button type="submit" [disabled]="!loginForm.valid" class="btn-primary">Login</button>

        <p *ngIf="errorMessage" class="error-msg">{{ errorMessage }}</p>
      </form>
    </div>
  `,
  styles: [`
    .login-container {
      width: 100vw;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #f4f7fa;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .login-form {
      background: #fff;
      padding: 2rem 2.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      width: 320px;
      box-sizing: border-box;
    }

    .title {
      text-align: center;
      margin-bottom: 1.5rem;
      font-weight: 700;
      font-size: 1.6rem;
      color: #003a8c; /* Primary blue */
    }

    .form-group {
      margin-bottom: 1.3rem;
      position: relative;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #212121;
    }

    select.form-control, input.form-control {
      width: 100%;
      padding: 0.45rem 0.7rem;
      font-size: 1rem;
      border: 1.6px solid #d9d9d9;
      border-radius: 4px;
      transition: border-color 0.3s ease;
      box-sizing: border-box;
    }

    select.form-control:focus, input.form-control:focus {
      border-color: #096dd9; /* primary blue */
      outline: none;
      box-shadow: 0 0 0 2px rgba(9,109,217,0.2);
    }

    /* Password field container */
    .password-group {
      display: flex;
      align-items: center;
    }

    input.form-control {
      flex: 1;
    }

    .show-hide-btn {
      margin-left: 0.6rem;
      background: transparent;
      border: none;
      color: #096dd9; /* Primary blue */
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      padding: 0.3rem 0.6rem;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }

    .show-hide-btn:hover, .show-hide-btn:focus {
      background-color: #e6f7ff;
      outline: none;
    }

    button.btn-primary {
      width: 100%;
      padding: 0.65rem 0;
      border: none;
      border-radius: 5px;
      background-color: #096dd9; /* Primary blue */
      color: white;
      font-weight: 700;
      font-size: 1.1rem;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    button.btn-primary:disabled {
      background-color: #aac7f7;
      cursor: not-allowed;
    }

    button.btn-primary:not(:disabled):hover {
      background-color: #0050b3;
    }

    .error-msg {
      margin-top: 1.2rem;
      color: #f5222d; /* Red */
      font-weight: 600;
      text-align: center;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  passwordFieldType = 'password';

  constructor(private fb: FormBuilder, private loginService: LoginService) {
    this.loginForm = this.fb.group({
      role: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  togglePassword() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  onSubmit() {
    this.errorMessage = '';
    if (this.loginForm.valid) {
      const { role, password } = this.loginForm.value;
      const success = this.loginService.login(role, password);
      if (!success) {
        this.errorMessage = 'Invalid role or password';
      }
    }
  }
}