import { Component } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (t of toastService.toasts(); track t.id) {
        <div class="toast" [class.success]="t.type === 'success'"
             [class.error]="t.type === 'error'" [class.info]="t.type === 'info'">
          {{ t.message }}
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container { position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; }
    .toast { padding: 14px 24px; border-radius: 8px; color: white; font-weight: 500; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideIn 0.3s ease; min-width: 250px; }
    .success { background: #27ae60; }
    .error { background: #e74c3c; }
    .info { background: #3498db; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  `]
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
