import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-asignaciones',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <h1>Asignación Categorías - Cocineros</h1>
      <button class="btn-nuevo" (click)="nuevo()">+ Asignar</button>

      <table>
        <thead><tr><th>ID</th><th>Cocinero</th><th>Categoría</th><th>Acciones</th></tr></thead>
        <tbody>
          @for (a of asignaciones(); track a.id) {
            <tr>
              <td>{{ a.id }}</td><td>{{ a.cocineroNombre }}</td><td>{{ a.categoria?.nombre }}</td>
              <td><button class="btn-del" (click)="eliminar(a.id)">Eliminar</button></td>
            </tr>
          }
        </tbody>
      </table>

      @if (showForm()) {
        <div class="modal">
          <div class="modal-content">
            <h2>Nueva Asignación</h2>
            <div class="form-group">
              <label>Cocinero</label>
              <select [(ngModel)]="form().cocineroNombre">
                <option value="Cocinero_1">Cocinero 1</option>
                <option value="Cocinero_2">Cocinero 2</option>
              </select>
            </div>
            <div class="form-group">
              <label>Categoría</label>
              <select [(ngModel)]="form().categoriaId">
                @for (c of categorias(); track c.id) {
                  <option [value]="c.id">{{ c.nombre }}</option>
                }
              </select>
            </div>
            <div class="modal-actions">
              <button (click)="guardar()">Guardar</button>
              <button class="cancel" (click)="showForm.set(false)">Cancelar</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 30px; }
    h1 { color: #1a1a2e; }
    .btn-nuevo { margin: 16px 0; padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 8px; cursor: pointer; }
    table { width: 100%; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-collapse: collapse; }
    th, td { text-align: left; padding: 12px 16px; border-bottom: 1px solid #eee; }
    th { background: #f8f9fa; color: #555; font-size: 13px; }
    .btn-del { padding: 4px 12px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; }
    .modal-content { background: white; padding: 30px; border-radius: 12px; width: 400px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 4px; font-weight: 500; font-size: 13px; }
    .form-group select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; }
    .modal-actions { display: flex; gap: 8px; margin-top: 20px; }
    .modal-actions button { flex: 1; padding: 10px; background: #1a1a2e; color: white; border: none; border-radius: 6px; cursor: pointer; }
    .modal-actions .cancel { background: #95a5a6; }
  `]
})
export class AsignacionesComponent implements OnInit {
  asignaciones = signal<any[]>([]);
  categorias = signal<any[]>([]);
  showForm = signal(false);
  form = signal<{ cocineroNombre: string; categoriaId: number | null }>({ cocineroNombre: 'Cocinero_1', categoriaId: null });

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.cargar();
    this.api.get<any[]>('/categorias').subscribe(r => this.categorias.set(r));
  }

  cargar() { this.api.get<any[]>('/asignaciones').subscribe(r => this.asignaciones.set(r)); }

  nuevo() { this.form.set({ cocineroNombre: 'Cocinero_1', categoriaId: this.categorias()[0]?.id }); this.showForm.set(true); }

  guardar() {
    const body = { cocineroNombre: this.form().cocineroNombre, categoria: { id: this.form().categoriaId } };
    this.api.post('/asignaciones', body).subscribe(() => {
      this.cargar(); this.showForm.set(false);
      this.toast.show('Asignación creada correctamente');
    });
  }

  eliminar(id: number) {
    this.api.delete(`/asignaciones/${id}`).subscribe(() => {
      this.cargar();
      this.toast.show('Asignación eliminada correctamente');
    });
  }
}
