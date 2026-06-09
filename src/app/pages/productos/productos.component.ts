import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <h1>Productos</h1>
      <button class="btn-nuevo" (click)="nuevo()">+ Nuevo Producto</button>

      <table>
        <thead><tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Categoría</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          @for (p of productos(); track p.id) {
            <tr>
              <td>{{ p.id }}</td><td>{{ p.nombre }}</td><td>S/ {{ p.precio }}</td>
              <td>{{ p.categoria?.nombre }}</td>
              <td>{{ p.estado === 1 ? 'Activo' : 'Inactivo' }}</td>
              <td>
                <button class="btn-edit" (click)="editar(p)">Editar</button>
                <button class="btn-del" (click)="eliminar(p.id)">Eliminar</button>
              </td>
            </tr>
          }
        </tbody>
      </table>

      @if (showForm()) {
        <div class="modal">
          <div class="modal-content">
            <h2>{{ editando() ? 'Editar' : 'Nuevo' }} Producto</h2>
            <div class="form-group">
              <label>Nombre</label>
              <input [(ngModel)]="form().nombre" placeholder="Nombre">
            </div>
            <div class="form-group">
              <label>Precio</label>
              <input type="number" step="0.01" [(ngModel)]="form().precio" placeholder="0.00">
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
    .btn-edit { padding: 4px 12px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .btn-del { padding: 4px 12px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; }
    .modal-content { background: white; padding: 30px; border-radius: 12px; width: 400px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 4px; font-weight: 500; font-size: 13px; }
    .form-group input, .form-group select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; }
    .modal-actions { display: flex; gap: 8px; margin-top: 20px; }
    .modal-actions button { flex: 1; padding: 10px; background: #1a1a2e; color: white; border: none; border-radius: 6px; cursor: pointer; }
    .modal-actions .cancel { background: #95a5a6; }
  `]
})
export class ProductosComponent implements OnInit {
  productos = signal<any[]>([]);
  categorias = signal<any[]>([]);
  showForm = signal(false);
  editando = signal(false);
  editId: number | null = null;
  form = signal<{ nombre: string; precio: number; categoriaId: number | null }>({ nombre: '', precio: 0, categoriaId: null });

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.cargar();
    this.api.get<any[]>('/categorias').subscribe(r => this.categorias.set(r));
  }

  cargar() { this.api.get<any[]>('/productos').subscribe(r => this.productos.set(r)); }

  nuevo() {
    this.editando.set(false);
    this.editId = null;
    this.form.set({ nombre: '', precio: 0, categoriaId: this.categorias()[0]?.id || null });
    this.showForm.set(true);
  }

  editar(p: any) {
    this.editando.set(true);
    this.editId = p.id;
    this.form.set({ nombre: p.nombre, precio: p.precio, categoriaId: p.categoria?.id });
    this.showForm.set(true);
  }

  guardar() {
    const body = {
      nombre: this.form().nombre,
      precio: this.form().precio,
      categoria: { id: this.form().categoriaId },
    };
    if (this.editando() && this.editId) {
      this.api.put(`/productos/${this.editId}`, body).subscribe(() => {
        this.cargar(); this.showForm.set(false);
        this.toast.show('Producto editado correctamente');
      });
    } else {
      this.api.post('/productos', body).subscribe(() => {
        this.cargar(); this.showForm.set(false);
        this.toast.show('Producto creado correctamente');
      });
    }
  }

  eliminar(id: number) {
    this.api.delete(`/productos/${id}`).subscribe(() => {
      this.cargar();
      this.toast.show('Producto eliminado correctamente');
    });
  }
}
