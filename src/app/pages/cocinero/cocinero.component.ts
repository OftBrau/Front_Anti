import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { WebSocketService } from '../../core/services/websocket.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-cocinero',
  standalone: true,
  template: `
    <div class="page">
      <h1>Cocina</h1>
      <div class="columns">
        <div class="col">
          <h2>Pendientes</h2>
          @for (d of pendientes(); track d.id) {
            <div class="item pendiente">
              <strong>{{ d.producto.nombre }}</strong>
              <span>Mesa {{ d.pedido.mesa.id }} × {{ d.cantidad }}</span>
              <button (click)="marcarListo(d.id)">Listo</button>
            </div>
          }
          @if (pendientes().length === 0) {
            <p class="empty">Sin pendientes</p>
          }
        </div>
        <div class="col">
          <h2>Listos</h2>
          @for (d of listos(); track d.id) {
            <div class="item listo">
              <strong>{{ d.producto.nombre }}</strong>
              <span>Mesa {{ d.pedido.mesa.id }} × {{ d.cantidad }}</span>
            </div>
          }
          @if (listos().length === 0) {
            <p class="empty">Sin listos</p>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 30px; }
    h1 { color: #1a1a2e; }
    .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
    .col { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .col h2 { font-size: 16px; color: #555; margin-bottom: 16px; }
    .item { padding: 12px; border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
    .pendiente { background: #fff3cd; }
    .listo { background: #d4edda; }
    button { padding: 6px 14px; background: #27ae60; color: white; border: none; border-radius: 6px; cursor: pointer; }
    .empty { color: #aaa; font-style: italic; }
  `]
})
export class CocineroComponent implements OnInit, OnDestroy {
  pendientes = signal<any[]>([]);
  listos = signal<any[]>([]);
  private cocinero = '';

  constructor(
    private api: ApiService,
    private ws: WebSocketService,
    private auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.cocinero = this.auth.getUsername() || '';
    this.cargar();
    this.ws.connect(() => {
      this.ws.subscribe('/topic/cocina', () => this.cargar());
    });
  }

  cargar() {
    this.api.get<any[]>(`/cocina/pendientes/${this.cocinero}`).subscribe(r => this.pendientes.set(r));
    this.api.get<any[]>('/cocina/listos').subscribe(r => this.listos.set(r));
  }

  marcarListo(id: number) {
    this.api.put(`/cocina/${id}/listo`, {}).subscribe(() => {
      this.cargar();
      this.toast.show('Producto marcado como listo');
    });
  }

  ngOnDestroy() { this.ws.disconnect(); }
}
