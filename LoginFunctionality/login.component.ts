import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  template: `
    <div style="max-width: 300px; margin: auto; padding: 1em; border: 1px solid #ccc;">
      <h2>Login</h2>
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <label for="role">Select Role</label><br/>
        <select formControlName="role" id="role" style="width: 100%; margin-bottom: 1em;">
          <option value="Maker">Maker</option>
          <option value="Checker1">Checker1</option>
          <option value="Checker2">Checker2</option>
          <option value="Checker3">Checker3</option>
        </select>

        <label for="password">Password</label><br/>
        <input type="password" formControlName="password" id="password" style="width: 100%; margin-bottom: 1em;" />

        <button type="submit" [disabled]="!loginForm.valid" style="width: 100%;">Login</button>
      </form>

      <p *ngIf="errorMessage" style="color: red;">{{ errorMessage }}</p>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';

  constructor(private fb: FormBuilder, private loginService: LoginService, private router: Router) {
    this.loginForm = this.fb.group({
      role: ['Maker', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { role, password } = this.loginForm.value;
      const success = this.loginService.login(role, password);
      if (!success) {
        this.errorMessage = 'Invalid role or password';
      }
    }
  }
}