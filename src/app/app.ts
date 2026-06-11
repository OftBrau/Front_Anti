import { Component } from '@angular/core';
import { RouterOutlet, NavigationEnd, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { ToastComponent } from './shared/toast/toast.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, SidebarComponent, ToastComponent],
  template: `
    <app-toast></app-toast>
    <div class="app-layout">
      <app-sidebar *ngIf="showSidebar"></app-sidebar>
      <main [class.with-sidebar]="showSidebar">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; }
    main { flex: 1; background: #f5f5f5; }
    main.with-sidebar { margin-left: 0; }
  `]
})
export class App {
  showSidebar: boolean;

  constructor(private router: Router) {
    this.showSidebar = router.url !== '/login';
    router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.showSidebar = e.url !== '/login';
    });
  }
}
