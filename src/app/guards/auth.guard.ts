import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) {
    const currentUser = authService.getUserData();
    if (currentUser) return true;
    else {
      return authService.loadUser().pipe(
        map((data) => {
          if (data && data.roles) {
            return true;
          }
          authService.logout();
          return false;
        }),
        catchError((err: any) => {
          authService.logout();
          return of(false);
        })
      );
    }
  }
  authService.logout();
  return false;
};
