import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  role_name: string;
  is_active: boolean;
  phone_number: string;
  profile_image: string | null;
  access: string;
  refresh: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/admin-login/`, { email, password })
      .pipe(
        tap(response => {
          this.setSession(response);
        })
      );
  }

  private setSession(authResult: LoginResponse): void {
    localStorage.setItem('access_token', authResult.access);
    localStorage.setItem('refresh_token', authResult.refresh);
    localStorage.setItem('user', JSON.stringify({
      id: authResult.id,
      email: authResult.email,
      first_name: authResult.first_name,
      last_name: authResult.last_name,
      role: authResult.role,
      role_name: authResult.role_name,
      phone_number: authResult.phone_number,
      profile_image: authResult.profile_image
    }));
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getCurrentUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  redirectToDashboard(): void {
    const user = this.getCurrentUser();
    if (user) {
      this.router.navigate(['/admin']);
    }
  }
}
