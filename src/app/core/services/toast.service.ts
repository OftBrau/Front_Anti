import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<{ message: string; type: Toast['type']; id: number }[]>([]);
  private nextId = 0;

  show(message: string, type: Toast['type'] = 'success') {
    const id = this.nextId++;
    this.toasts.update(list => [...list, { message, type, id }]);
    setTimeout(() => {
      this.toasts.update(list => list.filter(t => t.id !== id));
    }, 3000);
  }
}
