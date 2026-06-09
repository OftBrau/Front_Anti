import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-cajero',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <h1>Cajero</h1>
      <div class="layout">
        <div class="panel">
          <h2>Mesas Ocupadas</h2>
          @for (m of mesasOcupadas(); track m.id) {
            <div class="mesa-item" (click)="seleccionarMesa(m)"
                 [class.selected]="mesaSel()?.id === m.id">
              Mesa {{ m.id }}
            </div>
          }
          @if (mesasOcupadas().length === 0) {
            <p class="empty">No hay mesas ocupadas</p>
          }
        </div>

        @if (mesaSel(); as mesa) {
          <div class="panel">
            <h2>Mesa {{ mesa.id }} — Total: S/ {{ total().toFixed(2) }}</h2>
            @for (d of detalles(); track d.id) {
              <div class="detalle">
                {{ d.producto.nombre }} × {{ d.cantidad }} — S/ {{ (d.producto.precio * d.cantidad).toFixed(2) }}
              </div>
            }

            <div class="pago-actions">
              <select [(ngModel)]="metodoPago">
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Yape">Yape</option>
                <option value="Plin">Plin</option>
              </select>
              <input type="number" step="0.01" [(ngModel)]="montoRecibido" placeholder="Monto recibido" class="monto-input">
              <button (click)="cobrar()" [disabled]="!montoRecibido || montoRecibido < total()">
                Cobrar S/ {{ total().toFixed(2) }}
              </button>
            </div>
            @if (montoRecibido && montoRecibido < total()) {
              <p class="error">Monto insuficiente</p>
            }
            @if (montoRecibido && montoRecibido >= total()) {
              <p class="vuelto">Vuelto: S/ {{ (montoRecibido - total()).toFixed(2) }}</p>
            }
          </div>
        }
      </div>

      @if (comprobante(); as c) {
        <div class="modal">
          <div class="modal-content">
            <h2>🧾 Comprobante de Pago</h2>
            <p><strong>Venta #{{ c.ventaId }}</strong> — Mesa {{ c.mesaId }}</p>
            <p>Fecha: {{ formatDate(c.fecha) }}</p>
            <hr>
            @for (item of c.items; track item.producto) {
              <div class="comp-item">
                <span>{{ item.producto }} × {{ item.cantidad }}</span>
                <span>S/ {{ item.subtotal.toFixed(2) }}</span>
              </div>
            }
            <hr>
            <div class="comp-total">
              <span>Total:</span><span>S/ {{ c.total.toFixed(2) }}</span>
            </div>
            <div class="comp-linea">
              <span>Método de pago:</span><span>{{ c.metodoPago }}</span>
            </div>
            @if (c.montoRecibido) {
              <div class="comp-linea">
                <span>Monto recibido:</span><span>S/ {{ c.montoRecibido.toFixed(2) }}</span>
              </div>
            }
            @if (c.vuelto) {
              <div class="comp-linea">
                <span>Vuelto:</span><span>S/ {{ c.vuelto.toFixed(2) }}</span>
              </div>
            }
            <button (click)="comprobante.set(null)">Cerrar</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 30px; }
    h1 { color: #1a1a2e; }
    .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
    .panel { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .panel h2 { font-size: 16px; color: #555; margin-bottom: 16px; }
    .mesa-item { padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 8px; cursor: pointer; font-weight: 500; }
    .mesa-item:hover, .mesa-item.selected { background: #e9ecef; }
    .mesa-item.selected { border-left: 3px solid #1a1a2e; }
    .detalle { padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; }
    .pago-actions { margin-top: 20px; display: flex; gap: 12px; flex-wrap: wrap; }
    select { flex: 1; min-width: 120px; padding: 10px; border: 1px solid #ddd; border-radius: 8px; }
    .monto-input { flex: 1; min-width: 120px; padding: 10px; border: 1px solid #ddd; border-radius: 8px; }
    button { padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 15px; }
    button:disabled { background: #95a5a6; cursor: not-allowed; }
    .error { color: #e74c3c; font-size: 13px; margin-top: 8px; }
    .vuelto { color: #27ae60; font-weight: 500; margin-top: 8px; }
    .empty { color: #aaa; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
    .modal-content { background: white; padding: 30px; border-radius: 12px; width: 420px; max-height: 80vh; overflow-y: auto; }
    .modal-content h2 { margin-bottom: 16px; }
    .modal-content hr { margin: 12px 0; border: none; border-top: 1px dashed #ccc; }
    .comp-item { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
    .comp-total { display: flex; justify-content: space-between; font-weight: 700; font-size: 16px; padding: 8px 0; }
    .comp-linea { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; }
    .modal-content button { width: 100%; margin-top: 20px; padding: 12px; background: #1a1a2e; }
  `]
})
export class CajeroComponent implements OnInit {
  mesasOcupadas = signal<any[]>([]);
  mesaSel = signal<any>(null);
  detalles = signal<any[]>([]);
  total = signal(0);
  comprobante = signal<any>(null);
  metodoPago = 'Efectivo';
  montoRecibido: number | null = null;

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.api.get<any[]>('/mesas').subscribe(mesas => {
      this.mesasOcupadas.set(mesas.filter(m => m.estado !== 'Libre'));
    });
  }

  seleccionarMesa(m: any) {
    this.mesaSel.set(m);
    this.detalles.set([]);
    this.total.set(0);
    this.montoRecibido = null;
    this.api.get<any[]>(`/pedidos/mesa/${m.id}`).subscribe(pedidos => {
      const todos: any[] = [];
      let t = 0;
      let count = pedidos.length;

      if (count === 0) {
        this.detalles.set([]);
        this.total.set(0);
        return;
      }

      pedidos.forEach((p: any) => {
        this.api.get<any[]>(`/pedidos/${p.id}/detalle`).subscribe(dets => {
          dets.forEach((d: any) => {
            todos.push(d);
            t += d.producto.precio * d.cantidad;
          });
          count--;
          if (count === 0) {
            this.detalles.set(todos);
            this.total.set(t);
          }
        });
      });
    });
  }

  cobrar() {
    this.api.post<any>(`/pagos/mesa/${this.mesaSel().id}`, {
      metodoPago: this.metodoPago,
      montoRecibido: this.montoRecibido
    }).subscribe(comp => {
      this.comprobante.set(comp);
      this.mesaSel.set(null);
      this.detalles.set([]);
      this.total.set(0);
      this.montoRecibido = null;
      this.ngOnInit();
      this.toast.show('Pago procesado correctamente');
    });
  }

  formatDate(f: string) {
    if (!f) return '-';
    const d = new Date(f);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
