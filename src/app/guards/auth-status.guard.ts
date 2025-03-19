import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authStatusGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    authService.logout();
    return false;
  }

  const requiresPasswordReset = localStorage.getItem('requiresPasswordReset');
  const requiresEmailVerification = localStorage.getItem('requiresEmailVerification');

  if (requiresPasswordReset) {
    router.navigateByUrl('/reset-password');
    return false;
  }

  if (requiresEmailVerification) {
    router.navigateByUrl('/verify-email');
    return false;
  }

  return true;
};
