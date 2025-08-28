import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const noauthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const requiresPasswordReset = localStorage.getItem('requiresPasswordReset');

    if (requiresPasswordReset) {
      router.navigateByUrl('/reset-password');
      return false;
    }

    if (state.url === '/auth-support') {
      router.navigateByUrl('/support');
      return false;
    }

    router.navigateByUrl('/home');
    return false;
  }

  return true;
};
