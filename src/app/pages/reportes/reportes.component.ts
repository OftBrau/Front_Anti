import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <h1>Reportes</h1>

      <div class="filtros">
        <div class="filtro">
          <label>Mesa</label>
          <select [(ngModel)]="mesaFiltro" (change)="cargarVentas()">
            <option value="">Todas las mesas</option>
            @for (m of mesas(); track m.id) {
              <option [value]="m.id">Mesa {{ m.id }}</option>
            }
          </select>
        </div>
        <div class="filtro">
          <label>Desde</label>
          <input type="datetime-local" [(ngModel)]="fechaDesde" (change)="cargarVentas()">
        </div>
        <div class="filtro">
          <label>Hasta</label>
          <input type="datetime-local" [(ngModel)]="fechaHasta" (change)="cargarVentas()">
        </div>
      </div>

      <div class="card">
        <h2>Resumen</h2>
        <p>Total Ventas: <strong>S/ {{ totalVentas().toFixed(2) }}</strong></p>
        <p>Cantidad de Ventas: <strong>{{ ventas().length }}</strong></p>
      </div>

      @if (ventas().length) {
        <div class="card">
          <h2>Ventas</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Mesa</th>
                <th>Total</th>
                <th>Método</th>
                <th>Monto Recibido</th>
                <th>Vuelto</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              @for (v of ventas(); track v.id) {
                <tr>
                  <td>{{ v.id }}</td>
                  <td>Mesa {{ v.mesa?.id }}</td>
                  <td>S/ {{ v.total?.toFixed(2) }}</td>
                  <td>{{ v.metodoPago }}</td>
                  <td>{{ v.montoRecibido ? 'S/ ' + v.montoRecibido.toFixed(2) : '-' }}</td>
                  <td>{{ v.vuelto ? 'S/ ' + v.vuelto.toFixed(2) : '-' }}</td>
                  <td>{{ formatDate(v.fecha) }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 30px; }
    h1 { color: #1a1a2e; }
    .filtros { display: flex; gap: 16px; margin: 20px 0; flex-wrap: wrap; }
    .filtro { display: flex; flex-direction: column; gap: 4px; }
    .filtro label { font-size: 12px; color: #555; font-weight: 500; }
    .filtro select, .filtro input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; }
    .card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 20px; }
    .card h2 { font-size: 16px; color: #555; margin-bottom: 12px; }
    .card p { font-size: 18px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
    th { background: #f8f9fa; color: #555; font-size: 12px; }
  `]
})
export class ReportesComponent implements OnInit {
  ventas = signal<any[]>([]);
  mesas = signal<any[]>([]);
  totalVentas = signal(0);
  mesaFiltro = '';
  fechaDesde = '';
  fechaHasta = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<any[]>('/mesas').subscribe(r => this.mesas.set(r));
    this.cargarVentas();
  }

  cargarVentas() {
    if (this.mesaFiltro) {
      this.api.get<any[]>(`/reportes/mesa/${this.mesaFiltro}`).subscribe(r => {
        this.ventas.set(r);
        this.totalVentas.set(r.reduce((s, v) => s + (v.total || 0), 0));
      });
    } else if (this.fechaDesde && this.fechaHasta) {
      const desde = this.fechaDesde.replace('T', '') + ':00';
      const hasta = this.fechaHasta.replace('T', '') + ':00';
      this.api.get<any>(`/reportes/rango?desde=${encodeURIComponent(desde)}&hasta=${encodeURIComponent(hasta)}`)
        .subscribe(r => {
          this.ventas.set(r);
          this.totalVentas.set(r.reduce((s: number, v: any) => s + (v.total || 0), 0));
        });
    } else {
      this.api.get<any>('/reportes/diario').subscribe(r => {
        this.ventas.set(r.ventas || []);
        this.totalVentas.set(r.totalVentas || 0);
      });
    }
  }

  formatDate(f: string) {
    if (!f) return '-';
    const d = new Date(f);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
