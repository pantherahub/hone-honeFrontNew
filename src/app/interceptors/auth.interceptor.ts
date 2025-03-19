import { HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { HttpErrorResponse, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, EMPTY } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { RefreshTokenResponse } from '../models/auth.interface';
import { Router } from '@angular/router';

const excludedUrls = ['/Auth/Login', '/Auth/UpdateTokens'];
let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<RefreshTokenResponse | null> = new BehaviorSubject<RefreshTokenResponse | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Ignore routes
  if (excludedUrls.some(url => req.url.includes(url))) {
    return next(req);
  }

  if (req.headers.get('Skip-Auth') === 'true') {
    // Remove "Skip-Auth" request header
    const modifiedReq = req.clone({
      headers: req.headers.delete('Skip-Auth'),
    });
    return next(modifiedReq);
  }

  const addAuthToken = (request: HttpRequest<any>): HttpRequest<any> => {
    const token = authService.getAccessToken();
    return token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
  };

  const handle401Error = (request: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    if (!isRefreshing) {
      isRefreshing = true;
      return authService.refreshAccessToken().pipe(
        switchMap((res: RefreshTokenResponse) => {
          if (!res.ok) {
            isRefreshing = false;
            refreshTokenSubject.next(res);
            authService.logout();
            return EMPTY;
          }
          isRefreshing = false;
          refreshTokenSubject.next(res);
          return next(addAuthToken(request));
        }),
        catchError((error) => {
          isRefreshing = false;
          refreshTokenSubject.error(error);
          if (error.status === 401) {
            refreshTokenSubject = new BehaviorSubject<RefreshTokenResponse | null>(null);
            authService.logout();
            return EMPTY;
          }
          return throwError(() => error);
        })
      );
    } else {
      return refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap((token: RefreshTokenResponse | null) => {
          if (token && !token.ok) return EMPTY;
          return next(addAuthToken(request));
        }),
        catchError((error) => {
          if (error.status === 401) return EMPTY;
          return throwError(() => error)
        })
      );
    }
  };

  const handle403Error = (error: HttpErrorResponse): boolean => {
    if (error.error?.renewPassword) {
      router.navigate(['/reset-password']);
      return true;
    } else if (error.error?.withVerificationEmail === false) {
      router.navigate(['/verify-email']);
      return true;
    }
    return false;
  };

  return next(addAuthToken(req)).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/Auth/UpdateTokens') && !req.url.includes('/Auth/Logout')) {
        return handle401Error(req, next);
      } else if (error.status === 403 && !req.url.includes('/Auth/UpdateTokens') && !req.url.includes('/Auth/Logout')) {
        const handled = handle403Error(error);
        if (handled) return EMPTY;
      }
      return throwError(() => error);
    })
  );
};
