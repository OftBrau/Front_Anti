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
      <div class="header">
        <h1>Cajero</h1>
        <div class="header-actions">
          <button class="btn-primary" (click)="recargar()">↻ Actualizar</button>
        </div>
      </div>

      <div class="layout">
        <div class="card mesas-list">
          <h2>Mesas Ocupadas</h2>
          @for (m of mesasOcupadas(); track m.id) {
            <div class="mesa-card" (click)="seleccionarMesa(m)"
                 [class.active]="mesaSel()?.id === m.id">
              <div class="mesa-num">Mesa {{ m.id }}</div>
              <div class="mesa-state">Pedido activo</div>
            </div>
          }
          @if (mesasOcupadas().length === 0) {
            <div class="empty-state">
              <span class="empty-icon">🔲</span>
              <p>No hay mesas ocupadas</p>
            </div>
          }
        </div>

        @if (mesaSel(); as mesa) {
          <div class="card order-panel">
            <div class="order-header">
              <h2>Mesa {{ mesa.id }}</h2>
              <div class="order-total-badge">S/ {{ total().toFixed(2) }}</div>
            </div>

            <div class="detalle-header">
              <span>Producto</span><span>Cant.</span><span>Subtotal</span>
            </div>

            @for (d of detalles(); track d.id) {
              <div class="detalle-row">
                <span class="detalle-nombre">{{ d.producto.nombre }}</span>
                <span class="detalle-cant">× {{ d.cantidad }}</span>
                <span class="detalle-subtotal">S/ {{ ((d.precio ?? d.producto.precio) * d.cantidad).toFixed(2) }}</span>
              </div>
            }

            <div class="detalle-total">
              <span>TOTAL</span><span>S/ {{ total().toFixed(2) }}</span>
            </div>

            <div class="pago-section">
              <h3>Procesar Pago</h3>
              <div class="pago-row">
                <select [(ngModel)]="metodoPago" class="pago-select">
                  <option value="Efectivo">💵 Efectivo</option>
                  <option value="Tarjeta">💳 Tarjeta</option>
                  <option value="Yape">📱 Yape</option>
                  <option value="Plin">📱 Plin</option>
                </select>
                <div class="monto-group">
                  <label>Recibido</label>
                  <input type="number" step="0.01" [(ngModel)]="montoRecibido"
                         placeholder="0.00" class="monto-input">
                </div>
              </div>

              @if (montoRecibido && montoRecibido < total()) {
                <div class="msg error">
                  Monto insuficiente — faltan S/ {{ (total() - montoRecibido).toFixed(2) }}
                </div>
              }
              @if (montoRecibido && montoRecibido >= total()) {
                <div class="msg success">
                  Vuelto: S/ {{ (montoRecibido - total()).toFixed(2) }}
                </div>
              }

              <button class="btn-primary btn-cobrar"
                      (click)="cobrar()"
                      [disabled]="!montoRecibido || montoRecibido < total()">
                Cobrar S/ {{ total().toFixed(2) }}
              </button>
            </div>
          </div>
        }
      </div>

      @if (comprobante(); as c) {
        <div class="modal">
          <div class="modal-content comprobante-modal">
            <div class="comp-header">
              <span class="comp-icon">🧾</span>
              <h2>Comprobante de Pago</h2>
            </div>

            <div class="comp-meta">
              <div class="comp-meta-row">
                <span>Venta #{{ c.ventaId }}</span>
                <span>Mesa {{ c.mesaId }}</span>
              </div>
              <div class="comp-fecha">{{ formatDate(c.fecha) }}</div>
            </div>

            <div class="comp-divider"></div>

            <div class="comp-items">
              @for (item of c.items; track item.producto) {
                <div class="comp-item">
                  <div class="comp-item-info">
                    <span class="comp-item-name">{{ item.producto }}</span>
                    <span class="comp-item-qty">× {{ item.cantidad }}</span>
                  </div>
                  <span class="comp-item-price">S/ {{ item.subtotal.toFixed(2) }}</span>
                </div>
              }
            </div>

            <div class="comp-divider"></div>

            <div class="comp-summary">
              <div class="comp-line"><span>Total</span><span>S/ {{ c.total.toFixed(2) }}</span></div>
              <div class="comp-line"><span>Método de pago</span><span>{{ c.metodoPago }}</span></div>
              @if (c.montoRecibido) {
                <div class="comp-line"><span>Monto recibido</span><span>S/ {{ c.montoRecibido.toFixed(2) }}</span></div>
              }
              @if (c.vuelto) {
                <div class="comp-line comp-vuelto"><span>Vuelto</span><span>S/ {{ c.vuelto.toFixed(2) }}</span></div>
              }
            </div>

            <button class="btn-primary comp-cerrar" (click)="comprobante.set(null)">Cerrar</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header h1 { margin-bottom: 0; }
    .header-actions button { background: #636e72; }
    .layout { display: grid; grid-template-columns: 300px 1fr; gap: 24px; align-items: start; }
    .mesas-list { min-height: 200px; }
    .mesa-card {
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 10px;
      cursor: pointer;
      background: #f8f9fa;
      border: 2px solid transparent;
      transition: all 0.2s ease;
    }
    .mesa-card:hover { border-color: #dfe6e9; }
    .mesa-card.active { border-color: #1a1a2e; background: #f0f0f5; }
    .mesa-num { font-weight: 600; font-size: 16px; color: #1a1a2e; }
    .mesa-state { font-size: 12px; color: #636e72; margin-top: 2px; }
    .empty-state { text-align: center; padding: 40px 0; }
    .empty-icon { font-size: 32px; display: block; margin-bottom: 8px; }
    .empty-state p { color: #b2bec3; font-size: 14px; }
    .order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #f1f3f5; }
    .order-header h2 { margin-bottom: 0; }
    .order-total-badge { font-size: 24px; font-weight: 700; color: #00b894; }
    .detalle-header { display: grid; grid-template-columns: 1fr 60px 100px; gap: 12px; padding: 8px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #636e72; border-bottom: 1px solid #f1f3f5; margin-bottom: 4px; }
    .detalle-header span:last-child { text-align: right; }
    .detalle-row { display: grid; grid-template-columns: 1fr 60px 100px; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f8f9fa; font-size: 14px; }
    .detalle-nombre { color: #2d3436; font-weight: 500; }
    .detalle-cant { color: #636e72; text-align: center; }
    .detalle-subtotal { text-align: right; font-weight: 500; color: #2d3436; }
    .detalle-total { display: flex; justify-content: space-between; padding: 16px 0 0; font-size: 18px; font-weight: 700; color: #1a1a2e; border-top: 2px solid #1a1a2e; margin-top: 12px; }
    .pago-section { margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f3f5; }
    .pago-section h3 { font-size: 15px; font-weight: 600; margin-bottom: 16px; color: #2d3436; }
    .pago-row { display: flex; gap: 12px; align-items: end; }
    .pago-select { flex: 1; padding: 12px 14px; }
    .monto-group { flex: 1; }
    .monto-group label { display: block; font-size: 12px; font-weight: 600; color: #636e72; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.3px; }
    .monto-input { width: 100%; padding: 12px 14px; font-size: 18px; font-weight: 600; text-align: right; }
    .msg { padding: 12px 16px; border-radius: 10px; font-size: 14px; font-weight: 500; margin-top: 12px; }
    .msg.error { background: #fff5f5; color: #e74c3c; }
    .msg.success { background: #f0fff4; color: #00b894; }
    .btn-cobrar { width: 100%; margin-top: 16px; padding: 14px; font-size: 16px; font-weight: 600; }
    .comprobante-modal { width: 460px; }
    .comp-header { text-align: center; margin-bottom: 20px; }
    .comp-icon { font-size: 40px; display: block; margin-bottom: 8px; }
    .comp-header h2 { margin-bottom: 0; }
    .comp-meta { background: #f8f9fa; padding: 16px; border-radius: 12px; margin-bottom: 16px; }
    .comp-meta-row { display: flex; justify-content: space-between; font-weight: 600; font-size: 15px; }
    .comp-fecha { font-size: 12px; color: #636e72; margin-top: 4px; }
    .comp-divider { height: 1px; background: #e9ecef; margin: 12px 0; }
    .comp-items { margin-bottom: 8px; }
    .comp-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
    .comp-item-info { display: flex; gap: 8px; align-items: center; }
    .comp-item-name { font-weight: 500; font-size: 14px; }
    .comp-item-qty { color: #636e72; font-size: 13px; }
    .comp-item-price { font-weight: 600; font-size: 14px; }
    .comp-summary { margin-bottom: 8px; }
    .comp-line { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
    .comp-line:last-child { padding-bottom: 0; }
    .comp-vuelto { font-weight: 700; color: #00b894; font-size: 16px; }
    .comp-cerrar { width: 100%; margin-top: 20px; padding: 14px; font-size: 15px; font-weight: 600; }
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

  ngOnInit() { this.cargarMesas(); }

  cargarMesas() {
    this.api.get<any[]>('/mesas').subscribe(mesas => {
      this.mesasOcupadas.set(mesas.filter(m => m.estado !== 'Libre'));
    });
  }

  recargar() { this.cargarMesas(); }

  seleccionarMesa(m: any) {
    this.mesaSel.set(m);
    this.detalles.set([]);
    this.total.set(0);
    this.montoRecibido = null;
    this.api.get<any[]>(`/pedidos/mesa/${m.id}`).subscribe(pedidos => {
      if (pedidos.length === 0) return;
      let t = 0;
      let pendientes = pedidos.length;
      const todos: any[] = [];
      pedidos.forEach((p: any) => {
        this.api.get<any[]>(`/pedidos/${p.id}/detalle`).subscribe(dets => {
          dets.forEach(d => {
            todos.push(d);
            t += (d.precio ?? d.producto.precio) * d.cantidad;
          });
          pendientes--;
          if (pendientes === 0) {
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
    }).subscribe({
      next: comp => {
        this.comprobante.set(comp);
        this.mesaSel.set(null);
        this.detalles.set([]);
        this.total.set(0);
        this.montoRecibido = null;
        this.cargarMesas();
        this.toast.show('Pago procesado correctamente');
      },
      error: err => this.toast.show(err.error?.message || err.error?.error || 'Error al procesar pago', 'error')
    });
  }

  formatDate(f: string) {
    if (!f) return '-';
    const d = new Date(f);
    return d.toLocaleDateString('es-PE', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
