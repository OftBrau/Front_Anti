import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <h1>Anticuchería Mechita
        </h1>
        <p class="subtitle">Sistema de Gestión</p>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Usuario</label>
            <input type="text" [(ngModel)]="username" name="username" required placeholder="Ingresa tu usuario">
          </div>
          <div class="form-group">
            <label>Contraseña</label>
            <input type="password" [(ngModel)]="password" name="password" required placeholder="Ingresa tu contraseña">
          </div>
          <button type="submit" [disabled]="loading">{{ loading ? 'Ingresando...' : 'Ingresar' }}</button>
          <p *ngIf="error" class="error">{{ error }}</p>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); }
    .login-card { background: white; padding: 40px; border-radius: 16px; width: 380px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    .login-card h1 { text-align: center; color: #1a1a2e; margin-bottom: 4px; }
    .subtitle { text-align: center; color: #777; margin-bottom: 28px; font-size: 14px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-weight: 500; color: #555; font-size: 13px; }
    .form-group input { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
    .form-group input:focus { outline: none; border-color: #1a1a2e; }
    button { width: 100%; padding: 12px; background: #1a1a2e; color: white; border: none; border-radius: 8px; font-size: 15px; cursor: pointer; }
    button:hover:not(:disabled) { background: #16213e; }
    button:disabled { opacity: 0.6; }
    .error { color: #e74c3c; text-align: center; margin-top: 12px; font-size: 13px; }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error = '';

  private redirects: Record<string, string> = {
    CONTROL: '/dashboard',
    MESAS: '/gestion-mesas',
    CAJERO: '/cajero',
    COCINERO_1: '/cocinero',
    COCINERO_2: '/cocinero',
  };

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.auth.login(this.username, this.password).subscribe({
      next: (res) => {
        this.router.navigate([this.redirects[res.rol] || '/login']);
      },
      error: () => {
        this.error = 'Credenciales incorrectas';
        this.loading = false;
      },
    });
  }
}
