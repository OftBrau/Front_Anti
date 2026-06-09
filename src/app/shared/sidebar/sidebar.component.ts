import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgIf, RouterLink, RouterLinkActive],
  template: `
    <nav class="sidebar">
      <div class="sidebar-header">
        <h3>Anticuchería</h3>
        <span class="rol-badge">{{ rol }}</span>
      </div>
      <ul class="nav-list">
        <li *ngIf="rol === 'CONTROL'">
          <a routerLink="/dashboard" routerLinkActive="active">📊 Dashboard</a>
        </li>
        <li *ngIf="rol === 'CONTROL'">
          <a routerLink="/mesas" routerLinkActive="active">🪑 Mesas</a>
        </li>
        <li *ngIf="rol === 'CONTROL'">
          <a routerLink="/productos" routerLinkActive="active">📦 Productos</a>
        </li>
        <li *ngIf="rol === 'CONTROL'">
          <a routerLink="/categorias" routerLinkActive="active">📁 Categorías</a>
        </li>
        <li *ngIf="rol === 'CONTROL'">
          <a routerLink="/asignaciones" routerLinkActive="active">👨‍🍳 Asignaciones</a>
        </li>
        <li *ngIf="rol === 'CONTROL'">
          <a routerLink="/reportes" routerLinkActive="active">📈 Reportes</a>
        </li>
        <li *ngIf="rol === 'MESAS' || rol === 'CONTROL'">
          <a routerLink="/gestion-mesas" routerLinkActive="active">🪑 Gestión Mesas</a>
        </li>
        <li *ngIf="rol === 'COCINERO_1' || rol === 'COCINERO_2' || rol === 'CONTROL'">
          <a routerLink="/cocinero" routerLinkActive="active">👨‍🍳 Cocina</a>
        </li>
        <li *ngIf="rol === 'CAJERO' || rol === 'CONTROL'">
          <a routerLink="/cajero" routerLinkActive="active">💵 Cajero</a>
        </li>
      </ul>
      <div class="sidebar-footer">
        <span>{{ username }}</span>
        <button (click)="auth.logout()">Cerrar Sesión</button>
      </div>
    </nav>
  `,
  styles: [`
    .sidebar { width: 240px; min-height: 100vh; background: #1a1a2e; color: white; display: flex; flex-direction: column; }
    .sidebar-header { padding: 20px; border-bottom: 1px solid #16213e; }
    .sidebar-header h3 { margin: 0; font-size: 18px; }
    .rol-badge { display: inline-block; margin-top: 6px; padding: 2px 10px; background: #0f3460; border-radius: 10px; font-size: 12px; }
    .nav-list { list-style: none; padding: 0; margin: 0; flex: 1; }
    .nav-list li a { display: block; padding: 12px 20px; color: #a8a8b3; text-decoration: none; transition: all 0.2s; }
    .nav-list li a:hover, .nav-list li a.active { background: #16213e; color: white; }
    .sidebar-footer { padding: 16px 20px; border-top: 1px solid #16213e; font-size: 13px; }
    .sidebar-footer button { margin-top: 8px; width: 100%; padding: 6px; background: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer; }
  `]
})
export class SidebarComponent implements OnInit {
  rol = '';
  username = '';

  constructor(public auth: AuthService) {}

  ngOnInit() {
    this.rol = this.auth.getRol() || '';
    this.username = this.auth.getUsername() || '';
  }
}
