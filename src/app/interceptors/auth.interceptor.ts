import { HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { HttpErrorResponse, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';

const excludedUrls = ['/Auth/Login', '/Auth/UpdateTokens'];

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  let isRefreshing = false;
  let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

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
        switchMap((newToken: string) => {
          isRefreshing = false;
          refreshTokenSubject.next(newToken);
          return next(addAuthToken(request));
        }),
        catchError((error) => {
          isRefreshing = false;
          refreshTokenSubject.error(error);
          if (error.status === 401) {
            refreshTokenSubject = new BehaviorSubject<string | null>(null);
            authService.logout();
          }
          return throwError(() => error);
        })
      );
    } else {
      return refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => next(addAuthToken(request))),
        catchError(error => throwError(() => error))
      );
    }
  };

  return next(addAuthToken(req)).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/Auth/UpdateTokens') && !req.url.includes('/Auth/Logout')) {
        return handle401Error(req, next);
      }
      return throwError(() => error);
    })
  );
};
