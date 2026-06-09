import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MesasComponent } from './pages/mesas/mesas.component';
import { GestionMesasComponent } from './pages/gestion-mesas/gestion-mesas.component';
import { CocineroComponent } from './pages/cocinero/cocinero.component';
import { CajeroComponent } from './pages/cajero/cajero.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { CategoriasComponent } from './pages/categorias/categorias.component';
import { AsignacionesComponent } from './pages/asignaciones/asignaciones.component';
import { ReportesComponent } from './pages/reportes/reportes.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { roles: ['CONTROL'] } },
  { path: 'mesas', component: MesasComponent, canActivate: [AuthGuard], data: { roles: ['CONTROL'] } },
  { path: 'gestion-mesas', component: GestionMesasComponent, canActivate: [AuthGuard], data: { roles: ['MESAS', 'CONTROL'] } },
  { path: 'cocinero', component: CocineroComponent, canActivate: [AuthGuard], data: { roles: ['COCINERO_1', 'COCINERO_2', 'CONTROL'] } },
  { path: 'cajero', component: CajeroComponent, canActivate: [AuthGuard], data: { roles: ['CAJERO', 'CONTROL'] } },
  { path: 'productos', component: ProductosComponent, canActivate: [AuthGuard], data: { roles: ['CONTROL'] } },
  { path: 'categorias', component: CategoriasComponent, canActivate: [AuthGuard], data: { roles: ['CONTROL'] } },
  { path: 'asignaciones', component: AsignacionesComponent, canActivate: [AuthGuard], data: { roles: ['CONTROL'] } },
  { path: 'reportes', component: ReportesComponent, canActivate: [AuthGuard], data: { roles: ['CONTROL', 'CAJERO'] } },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
