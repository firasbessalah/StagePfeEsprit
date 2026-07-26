import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AuthRequest, AuthResponse, RegisterRequest, UserDTO, UserRole } from './auth.models';

const STORAGE_KEY = 'pfe.auth';

type StoredAuth = { token: string; user: UserDTO };

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly token = signal<string | null>(null);
  readonly user = signal<UserDTO | null>(null);

  constructor(private http: HttpClient) {
    this.hydrateFromStorage();
  }

  isAuthenticated(): boolean {
    return !!this.token();
  }

  hasRole(roles: readonly string[]): boolean {
    const u = this.user();
    if (!u?.role) return false;
    return roles.includes(String(u.role));
  }

  login(payload: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiBaseUrl}/api/auth/login`, payload).pipe(
      tap((res) => {
        this.setAuth(res.token, res.user);
      })
    );
  }

  loginWithGoogle(credential: string, role: 'LOCATAIRE' | 'BAILLEUR', telephone?: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiBaseUrl}/api/auth/google`, { credential, role, telephone }).pipe(
      tap((res) => {
        this.setAuth(res.token, res.user);
      })
    );
  }

  register(payload: RegisterRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiBaseUrl}/api/auth/register`, payload);
  }

  checkEmail(email: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${environment.apiBaseUrl}/api/auth/check-email`, {
      params: { email }
    });
  }

  verifyEmail(payload: { email: string; code: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiBaseUrl}/api/auth/verify`, payload);
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiBaseUrl}/api/auth/forgot-password`, { email });
  }

  verifyResetCode(payload: { email: string; code: string }): Observable<{ resetToken: string }> {
    return this.http.post<{ resetToken: string }>(`${environment.apiBaseUrl}/api/auth/reset-password/verify-code`, payload);
  }

  confirmResetPassword(payload: { resetToken: string; newPassword: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiBaseUrl}/api/auth/reset-password/confirm`, payload);
  }

  logout(): void {
    this.token.set(null);
    this.user.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  /** Update current user in memory + localStorage (same JWT), e.g. after profile photo PUT. */
  updateSessionUser(user: UserDTO): void {
    const t = this.token();
    if (!t) return;
    this.user.set(user);
    this.persist(t, user);
  }

  getDefaultRouteForRole(): '/dashboard' | '/browse' | '/home' | '/' | '/login' {
    const role = this.user()?.role as UserRole | undefined;
    if (role === 'ADMIN') return '/dashboard';
    if (role === 'BAILLEUR' || role === 'LOCATAIRE') return '/browse';
    return '/login';
  }

  private setAuth(token: string, user: UserDTO): void {
    this.token.set(token);
    this.user.set(user);
    this.persist(token, user);
  }

  private persist(token: string, user: UserDTO): void {
    const stored: StoredAuth = { token, user };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }

  private hydrateFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<StoredAuth>;
      if (!parsed?.token || !parsed?.user) return;
      this.token.set(parsed.token);
      this.user.set(parsed.user as UserDTO);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

