import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';

import { AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) return router.parseUrl('/login');

  const roles = (route.data?.['roles'] as string[] | undefined) ?? [];
  if (roles.length === 0) return true;

  if (auth.hasRole(roles)) return true;

  return router.parseUrl(auth.getDefaultRouteForRole());
};

