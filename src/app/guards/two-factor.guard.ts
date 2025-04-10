import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of } from 'rxjs';
import { AuthInfo } from '../models/auth.interface';

export const twoFactorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    authService.logout();
    return false;
  }

  if (!authService.getTwoFactorAuthenticated()) {
    authService.setTwoFactorAuthenticated(false);
    return authService.loadUser().pipe(
      map((res) => {
        if (!res || res.ok === false || !res.data) {
          authService.logout();
          return false;
        }
        const authData: AuthInfo = {
          with2FA: res.data.with2FA
        };
        if (authData.with2FA) {
          router.navigate(['/two-factor'], {
            state: { returnUrl: state.url },
          });
        } else {
          router.navigate(['/validate-password'], {
            state: { returnUrl: state.url },
          });
        }
        return false;
      }),
      catchError((err: any) => {
        authService.logout();
        return of(false);
      })
    );
  }

  authService.setTwoFactorAuthenticated(false);
  return true;

};
