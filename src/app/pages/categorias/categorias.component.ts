import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <h1>Categorías</h1>
      <button class="btn-nuevo" (click)="nuevo()">+ Nueva Categoría</button>

      <table>
        <thead><tr><th>ID</th><th>Nombre</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          @for (c of categorias(); track c.id) {
            <tr>
              <td>{{ c.id }}</td><td>{{ c.nombre }}</td>
              <td>{{ c.estado === 1 ? 'Activo' : 'Inactivo' }}</td>
              <td>
                <button class="btn-edit" (click)="editar(c)">Editar</button>
                <button class="btn-toggle" [class.activo]="c.estado === 1" [class.inactivo]="c.estado === 0"
                        (click)="toggleEstado(c)">
                  {{ c.estado === 1 ? 'Desactivar' : 'Activar' }}
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>

      @if (showForm()) {
        <div class="modal">
          <div class="modal-content">
            <h2>{{ editando() ? 'Editar' : 'Nueva' }} Categoría</h2>
            <div class="form-group">
              <label>Nombre</label>
              <input [(ngModel)]="form().nombre" placeholder="Nombre">
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
    .btn-edit { padding: 4px 12px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .btn-del { padding: 4px 12px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .btn-toggle { padding: 4px 12px; border: none; border-radius: 4px; cursor: pointer; }
    .btn-toggle.activo { background: #e74c3c; color: white; }
    .btn-toggle.inactivo { background: #27ae60; color: white; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; }
    .modal-content { background: white; padding: 30px; border-radius: 12px; width: 400px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 4px; font-weight: 500; font-size: 13px; }
    .form-group input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; }
    .modal-actions { display: flex; gap: 8px; margin-top: 20px; }
    .modal-actions button { flex: 1; padding: 10px; background: #1a1a2e; color: white; border: none; border-radius: 6px; cursor: pointer; }
    .modal-actions .cancel { background: #95a5a6; }
  `]
})
export class CategoriasComponent implements OnInit {
  categorias = signal<any[]>([]);
  showForm = signal(false);
  editando = signal(false);
  editId: number | null = null;
  form = signal<{ nombre: string }>({ nombre: '' });

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() { this.cargar(); }

  cargar() { this.api.get<any[]>('/categorias?todas=true').subscribe(r => this.categorias.set(r)); }

  nuevo() { this.editando.set(false); this.editId = null; this.form.set({ nombre: '' }); this.showForm.set(true); }

  editar(c: any) { this.editando.set(true); this.editId = c.id; this.form.set({ nombre: c.nombre }); this.showForm.set(true); }

  guardar() {
    if (this.editando() && this.editId) {
      this.api.put(`/categorias/${this.editId}`, this.form()).subscribe(() => {
        this.cargar(); this.showForm.set(false);
        this.toast.show('Categoría editada correctamente');
      });
    } else {
      this.api.post('/categorias', this.form()).subscribe(() => {
        this.cargar(); this.showForm.set(false);
        this.toast.show('Categoría creada correctamente');
      });
    }
  }

  toggleEstado(c: any) {
    this.api.patch(`/categorias/${c.id}/estado`, {}).subscribe({
      next: () => {
        this.cargar();
        const msg = c.estado === 1 ? 'Categoría desactivada' : 'Categoría activada';
        this.toast.show(msg);
      },
      error: () => this.toast.show('Error al cambiar estado', 'error')
    });
  }
}
