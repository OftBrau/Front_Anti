import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    return this.http.post<{ token: string; rol: string }>(`${this.apiUrl}/login`, { username, password })
      .pipe(tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('rol', res.rol);
        localStorage.setItem('username', username);
      }));
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  getToken() { return localStorage.getItem('token'); }
  getRol() { return localStorage.getItem('rol'); }
  getUsername() { return localStorage.getItem('username'); }
  isLoggedIn() { return !!this.getToken(); }
}
