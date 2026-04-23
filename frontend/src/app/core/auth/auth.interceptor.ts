import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.auth.token();
    if (!token) return next.handle(req);

    // Only attach token to our Spring API (absolute URL in prod, or same-origin `/api/...` via dev proxy)
    if (!this.isBackendApiRequest(req.url)) return next.handle(req);

    const authed = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next.handle(authed);
  }

  private isBackendApiRequest(url: string): boolean {
    const base = environment.apiBaseUrl;
    if (base && base.length > 0) {
      return url.startsWith(base);
    }
    try {
      const pathname = url.startsWith('http') ? new URL(url).pathname : url.split('?')[0];
      return pathname.startsWith('/api/');
    } catch {
      return url.includes('/api/');
    }
  }
}

