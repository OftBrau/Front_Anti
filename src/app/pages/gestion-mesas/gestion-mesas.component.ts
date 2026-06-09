import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-gestion-mesas',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <h1>Gestión de Mesas</h1>
      <div class="layout">
        <div class="panel mesas-list">
          <h2>Mesas</h2>
          @for (m of mesas(); track m.id) {
            <div class="mesa-item"
                 [class.ocupada]="m.estado === 'Ocupada'"
                 [class.libre]="m.estado === 'Libre'"
                 (click)="seleccionarMesa(m)">
              Mesa {{ m.id }}
              <span class="estado-badge">{{ m.estado }}</span>
            </div>
          }
        </div>

        <div class="panel">
          <h2>Productos</h2>
          <select [(ngModel)]="catFiltro" (change)="filtrarProductos()">
            <option value="">Todas las categorías</option>
            @for (c of categorias(); track c.id) {
              <option [value]="c.id">{{ c.nombre }}</option>
            }
          </select>
          <div class="product-grid">
            @for (p of productosFiltrados(); track p.id) {
              <div class="product-card" (click)="agregarProducto(p)">
                <strong>{{ p.nombre }}</strong>
                <span>S/ {{ p.precio.toFixed(2) }}</span>
              </div>
            }
          </div>
        </div>

        <div class="panel order-panel">
          @if (mesaSel(); as mesa) {
            <h2>Mesa {{ mesa.id }} — Pedido</h2>
            <div class="detalle-list">
              @for (item of detalleActual(); track item.id) {
                <div class="detalle-item">
                  <span>{{ item.producto?.nombre }} × {{ item.cantidad }}</span>
                  <span>S/ {{ (item.producto?.precio * item.cantidad).toFixed(2) }}</span>
                  <button class="btn-quitar" (click)="quitarProducto(item)">✕</button>
                </div>
              }
              @if (detalleActual().length === 0) {
                <p class="empty">Sin productos</p>
              }
            </div>
            <div class="order-total">
              <strong>Total: S/ {{ totalActual().toFixed(2) }}</strong>
            </div>

            @if (disponibilidad(); as d) {
              <div class="disp-result" [class.ok]="d.disponible" [class.no]="!d.disponible">
                {{ d.disponible ? '✓ Todos disponibles' : '✗ ' + d.mensaje }}
              </div>
            }

            <div class="order-actions">
              @if (!pedidoActivo()) {
                <button class="btn-primary" (click)="verificar()">Verificar Disponibilidad</button>
                <button class="btn-primary" (click)="confirmar()" [disabled]="detalleActual().length === 0">
                  Confirmar Pedido
                </button>
              } @else {
                <button class="btn-cancel" (click)="cancelar()">Cancelar Pedido</button>
                <button class="btn-primary" (click)="enviarCocina()">Enviar a Cocina</button>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 30px; }
    h1 { color: #1a1a2e; }
    .layout { display: grid; grid-template-columns: 1fr 1.5fr 1.5fr; gap: 20px; margin-top: 20px; }
    .panel { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .panel h2 { font-size: 16px; color: #555; margin-bottom: 16px; }
    .mesa-item { padding: 12px; border-radius: 8px; margin-bottom: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
    .mesa-item.libre { background: #d4edda; }
    .mesa-item.ocupada { background: #fff3cd; }
    .mesa-item:hover { opacity: 0.9; }
    .estado-badge { font-size: 11px; padding: 2px 8px; border-radius: 4px; background: rgba(0,0,0,0.1); }
    select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 12px; }
    .product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; max-height: 400px; overflow-y: auto; }
    .product-card { padding: 10px; background: #f1f3f5; border-radius: 8px; cursor: pointer; text-align: center; }
    .product-card strong { display: block; font-size: 13px; }
    .product-card span { font-size: 12px; color: #555; }
    .product-card:hover { background: #e9ecef; }
    .detalle-list { max-height: 300px; overflow-y: auto; }
    .detalle-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee; font-size: 13px; }
    .btn-quitar { background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 16px; }
    .empty { color: #aaa; font-style: italic; }
    .order-total { text-align: right; padding: 12px 0; font-size: 16px; }
    .disp-result { margin: 8px 0; padding: 8px; border-radius: 8px; font-weight: 500; text-align: center; }
    .disp-result.ok { background: #d4edda; color: #155724; }
    .disp-result.no { background: #f8d7da; color: #721c24; }
    .order-actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
    .btn-primary { flex: 1; padding: 10px; background: #1a1a2e; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
    .btn-primary:disabled { background: #95a5a6; cursor: not-allowed; }
    .btn-cancel { flex: 1; padding: 10px; background: #e74c3c; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
  `]
})
export class GestionMesasComponent implements OnInit {
  mesas = signal<any[]>([]);
  categorias = signal<any[]>([]);
  productos = signal<any[]>([]);
  productosFiltrados = signal<any[]>([]);
  mesaSel = signal<any>(null);
  pedidoActivo = signal<any>(null);
  detalleActual = signal<any[]>([]);
  totalActual = signal(0);
  disponibilidad = signal<any>(null);
  catFiltro = '';

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.api.get<any[]>('/mesas').subscribe(r => this.mesas.set(r));
    this.api.get<any[]>('/categorias').subscribe(r => this.categorias.set(r));
    this.api.get<any[]>('/productos').subscribe(r => {
      this.productos.set(r);
      this.productosFiltrados.set(r);
    });
  }

  seleccionarMesa(m: any) {
    this.mesaSel.set(m);
    this.pedidoActivo.set(null);
    this.detalleActual.set([]);
    this.totalActual.set(0);
    this.disponibilidad.set(null);

    this.api.get<any[]>(`/pedidos/mesa/${m.id}`).subscribe(pedidos => {
      if (pedidos.length > 0) {
        const p = pedidos[0];
        this.pedidoActivo.set(p);
        this.api.get<any[]>(`/pedidos/${p.id}/detalle`).subscribe(dets => {
          this.detalleActual.set(dets);
          this.totalActual.set(dets.reduce((s, d) => s + d.producto.precio * d.cantidad, 0));
        });
      }
    });
  }

  filtrarProductos() {
    if (!this.catFiltro) {
      this.productosFiltrados.set(this.productos());
    } else {
      this.productosFiltrados.set(this.productos().filter(p => p.categoria?.id === Number(this.catFiltro)));
    }
  }

  agregarProducto(p: any) {
    const existente = this.detalleActual().find(d => d.producto?.id === p.id);
    if (existente) {
      existente.cantidad += 1;
      this.detalleActual.set([...this.detalleActual()]);
    } else {
      this.detalleActual.update(d => [...d, { id: Date.now(), producto: p, cantidad: 1 }]);
    }
    this.totalActual.set(this.detalleActual().reduce((s, d) => s + d.producto.precio * d.cantidad, 0));
  }

  quitarProducto(item: any) {
    this.detalleActual.update(d => d.filter(x => x !== item));
    this.totalActual.set(this.detalleActual().reduce((s, d) => s + d.producto.precio * d.cantidad, 0));
  }

  verificar() {
    const items = this.detalleActual().map(d => ({ productoId: d.producto.id, cantidad: d.cantidad }));
    this.api.post<any>('/pedidos/verificar-disponibilidad', { items }).subscribe({
      next: r => this.disponibilidad.set(r),
      error: err => this.toast.show(err.error?.message || err.error?.error || 'Error al verificar disponibilidad', 'error')
    });
  }

  confirmar() {
    const mesa = this.mesaSel();
    if (!mesa) return;
    const items = this.detalleActual().map(d => ({
      productoId: d.producto.id,
      cantidad: d.cantidad
    }));
    this.api.post<any>('/pedidos/confirmar', { mesaId: mesa.id, items }).subscribe({
      next: pedido => {
        this.pedidoActivo.set(pedido);
        this.api.get<any[]>(`/pedidos/${pedido.id}/detalle`).subscribe(dets => {
          this.detalleActual.set(dets);
        });
        this.toast.show('Pedido confirmado correctamente');
      },
      error: err => this.toast.show(err.error?.message || err.error?.error || 'Error al confirmar pedido', 'error')
    });
  }

  cancelar() {
    const p = this.pedidoActivo();
    if (!p) return;
    this.api.put(`/pedidos/${p.id}/cancelar`, {}).subscribe(() => {
      this.pedidoActivo.set(null);
      this.detalleActual.set([]);
      this.totalActual.set(0);
      this.toast.show('Pedido cancelado');
    });
  }

  enviarCocina() {
    const p = this.pedidoActivo();
    if (!p) return;
    this.api.put(`/pedidos/${p.id}/enviar-cocina`, {}).subscribe({
      next: () => {
        this.pedidoActivo.set(null);
        this.detalleActual.set([]);
        this.totalActual.set(0);
        this.toast.show('Pedido enviado a cocina');
      },
      error: err => this.toast.show(err.error?.message || err.error?.error || 'Error al enviar a cocina', 'error')
    });
  }
}
