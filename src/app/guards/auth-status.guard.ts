import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authStatusGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    if (state.url === '/verify-email' || state.url === '/two-factor') {
      const hasTemporalLoginData = authService.getTemporalLoginData();
      if (!hasTemporalLoginData) {
        authService.logout();
        return false;
      }
      return true;
    }
    authService.logout();
    return false;
  }

  const requiresPasswordReset = localStorage.getItem('requiresPasswordReset');
  if (requiresPasswordReset) {
    router.navigateByUrl('/reset-password');
    return false;
  }

  return true;
};
