import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { WebSocketService } from '../../core/services/websocket.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-mesas',
  standalone: true,
  template: `
    <div class="page">
      <div class="header">
        <h1>Estado de Mesas</h1>
        <button class="btn-nuevo" (click)="crearMesa()">+ Nueva Mesa</button>
      </div>
      <div class="mesas-grid">
        @for (m of mesas(); track m.id) {
          <div class="mesa" [class.libre]="m.estado === 'Libre'" [class.ocupada]="m.estado !== 'Libre'">
            <span class="mesa-num">Mesa {{ m.id }}</span>
            <span class="mesa-estado">{{ m.estado }}</span>
            <button class="btn-del" (click)="eliminarMesa(m.id)">✕</button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 30px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { color: #1a1a2e; margin: 0; }
    .btn-nuevo { padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 8px; cursor: pointer; }
    .btn-nuevo:hover { background: #219a52; }
    .mesas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; }
    .mesa { background: white; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid #ddd; position: relative; }
    .mesa.libre { border-left-color: #27ae60; }
    .mesa.ocupada { border-left-color: #e74c3c; }
    .mesa-num { display: block; font-size: 20px; font-weight: 700; color: #1a1a2e; }
    .mesa-estado { display: block; margin-top: 6px; font-size: 13px; color: #777; }
    .btn-del { position: absolute; top: 6px; right: 6px; background: #e74c3c; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; }
    .mesa:hover .btn-del { opacity: 1; }
    .btn-del:hover { background: #c0392b; }
  `]
})
export class MesasComponent implements OnInit, OnDestroy {
  mesas = signal<any[]>([]);

  constructor(
    private api: ApiService,
    private ws: WebSocketService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.cargar();
    this.ws.connect(() => {
      this.ws.subscribe('/topic/mesas', () => this.cargar());
    });
  }

  cargar() {
    this.api.get<any[]>('/mesas').subscribe(r => this.mesas.set(r));
  }

  crearMesa() {
    this.api.post<any>('/mesas', {}).subscribe(() => {
      this.cargar();
      this.toast.show('Mesa creada correctamente');
    });
  }

  eliminarMesa(id: number) {
    if (confirm('¿Eliminar mesa ' + id + '?')) {
      this.api.delete(`/mesas/${id}`).subscribe(() => {
        this.cargar();
        this.toast.show('Mesa eliminada correctamente');
      });
    }
  }

  ngOnDestroy() { this.ws.disconnect(); }
}
