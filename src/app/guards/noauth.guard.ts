import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const noauthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const requiresPasswordReset = localStorage.getItem('requiresPasswordReset');

    if (requiresPasswordReset) {
      router.navigateByUrl('/reset-password');
      return false;
    }

    router.navigateByUrl('/home');
    return false;
  }

  if (state.url === '/verify-email') {
    const hasTemporalLoginData = authService.getTemporalLoginData();
    if (!hasTemporalLoginData) {
      router.navigateByUrl('/login');
      return false;
    }
  }
  return true;
};
