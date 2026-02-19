import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = route.data['roles'] as Array<string>;

  const user = authService.currentUser();

  if (user && requiredRoles.includes(user.role)) {
    return true;
  }

  return router.createUrlTree(['/unauthorized']);
};
