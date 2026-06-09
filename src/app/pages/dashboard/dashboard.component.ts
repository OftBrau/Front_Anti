import { Component, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="page">
      <h1>Dashboard</h1>
      @if (resumen(); as r) {
        <div class="cards">
          <div class="card"><h3>Mesas Totales</h3><p class="num">{{ r.totalMesas }}</p></div>
          <div class="card libre"><h3>Libres</h3><p class="num">{{ r.mesasLibres }}</p></div>
          <div class="card ocupada"><h3>Ocupadas</h3><p class="num">{{ r.mesasOcupadas }}</p></div>
          <div class="card pendiente"><h3>Pedidos Pendientes</h3><p class="num">{{ r.pedidosPendientes }}</p></div>
          <div class="card cocina"><h3>En Cocina</h3><p class="num">{{ r.cocinaPendiente }}</p></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 30px; }
    h1 { color: #1a1a2e; margin-bottom: 24px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
    .card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .card h3 { color: #555; font-size: 13px; text-transform: uppercase; margin-bottom: 8px; }
    .card .num { font-size: 32px; font-weight: 700; color: #1a1a2e; }
    .libre .num { color: #27ae60; } .ocupada .num { color: #e74c3c; } .pendiente .num { color: #f39c12; } .cocina .num { color: #3498db; }
  `]
})
export class DashboardComponent implements OnInit {
  resumen = signal<any>(null);

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<any>('/dashboard').subscribe(r => this.resumen.set(r));
  }
}
