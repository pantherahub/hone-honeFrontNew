import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { EventManagerService } from './events-manager/event-manager.service';
import { RefreshTokenResponse, TemporalLoginData, VerifyEmailReq } from '../models/auth.interface';

@Injectable({
   providedIn: 'root'
})
export class AuthService {
  public url = environment.url;
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly TEMP_LOGIN_DATA_KEY = 'temporalLoginData';
  private isTwoFactorAuthenticated = false;

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private eventManager: EventManagerService
  ) { }

  login(reqData: any): Observable<any> {
    return this.httpClient.post(
      `${environment.url}Auth/Login`,
      reqData
    ).pipe(
      tap((res: any) => {
        if (res.data) {
          const data = res.data;
          if (data.accessToken) {
            this.saveTokens(data.accessToken, data.refreshToken);
          }

          if (!data.withVerificationEmail) {
            localStorage.setItem('requiresEmailVerification', 'true');
          } else if (data.with2FA) {
            localStorage.setItem('requires2fa', 'true');
          } else if (data.renewPassword) {
            localStorage.setItem('requiresPasswordReset', 'true');
          }
        }
      })
    );
  }

  saveTokens(accessToken: string, refreshToken: string | null = null) {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    if (!refreshToken) return;
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  removeSession() {
    localStorage.removeItem("userLogged");
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setTwoFactorAuthenticated(status: boolean) {
    this.isTwoFactorAuthenticated = status;
  }
  getTwoFactorAuthenticated(): boolean {
    return this.isTwoFactorAuthenticated;
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token;
  }

  getUserData(): any | null {
    const user = localStorage.getItem("userLogged");
    return user ? JSON.parse(user) : null;
  }

  // Guarda en storage los datos del usuario logueado
  saveUserLogged(user: any) {
    localStorage.removeItem('userLogged');
    localStorage.setItem('userLogged', JSON.stringify(user));
    this.eventManager.userLogged.set(user);
  }

  loadUser(): Observable<any> {
    // Mock data
    const mockUsuario = {
      id: 3064,
      email: "resomagsa@rmcs.com.co",
      name: "Resonancia Magnetica Del Country S.A.",
      rejected: false,
      roles: {
        description: "Prestador Allianz",
        fullaccess: "no",
        idClientHoneSolutions: 4,
        idRoles: 5,
        nameRol: "PRESTADOR",
        slug: "PRESTADOR",
      },
      withData: true,
    };
    // Testing:
    this.saveUserLogged(mockUsuario);
    return of(mockUsuario);

    return this.httpClient.post(
      `${environment.url}Auth/GetUser`,
      null
      // { ACCESS_TOKEN: this.getAccessToken() }
    ).pipe(
      map((res: any) => {
        // this.user = res;
        this.saveUserLogged(mockUsuario);
        return mockUsuario;
        // return res;
      }), // temporal
      // catchError((error) => {
      //   // temporal
      //   localStorage.setItem("userLogged", JSON.stringify(mockUsuario));
      //   return of(mockUsuario)
      // })
    );
  }

  refreshAccessToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return of({ ok: false }).pipe(delay(0));
    }
    return this.httpClient.post<RefreshTokenResponse>(
      `${environment.url}Auth/UpdateTokens`,
      { refreshToken: this.getRefreshToken() }
    ).pipe(
      tap((res: RefreshTokenResponse) => {
        if (res.ok && res.data) {
          const newAccessToken = res.data.accessToken;
          this.saveTokens(newAccessToken);
        }
      }),
    );
  }

  saveTemporalLoginData(data: TemporalLoginData) {
    localStorage.setItem(this.TEMP_LOGIN_DATA_KEY, JSON.stringify(data));
  }
  getTemporalLoginData(): TemporalLoginData | null {
    const data = localStorage.getItem(this.TEMP_LOGIN_DATA_KEY);
    return data ? JSON.parse(data) as TemporalLoginData : null;
  }
  removeTemporalLoginData() {
    localStorage.removeItem(this.TEMP_LOGIN_DATA_KEY);
  }

  clearLocalStorage() {
    this.removeSession();
    this.removeTemporalLoginData();
    this.setTwoFactorAuthenticated(false);
    localStorage.removeItem('requires2fa');
    localStorage.removeItem('requiresEmailVerification');
    localStorage.removeItem('requiresPasswordReset');
    localStorage.removeItem('clientSelected');
    localStorage.removeItem('formState');
    localStorage.removeItem('tutorialStep');
    localStorage.removeItem('tutorialFinished');
  }

  private clearAuth() {
    this.clearLocalStorage();
    this.router.navigateByUrl('login');
  }

  public logout() {
    if (!this.isAuthenticated()) {
      this.clearAuth();
      return;
    }
    this.httpClient.post(
      `${environment.url}Auth/Logout`,
      null
    ).subscribe({
      next: (data: any) => {
        this.clearAuth();
      },
      error: (err: any) => {
        console.error(err);
        this.clearAuth();
      }
    });
  }

  /**
   * Forgot password - Send email and request code.
  */
  forgotSendEmail(reqData: any): Observable<any> {
    return this.httpClient.post(
      `${environment.url}Auth/Forgot/sendEmail`,
      reqData
    );
  }

  /**
   * Forgot password - Verify code sent to email.
  */
  forgotVerifyCode(reqData: any): Observable<any> {
    return this.httpClient.post(
      `${environment.url}Auth/Forgot/verifyCode`,
      reqData
    );
  }

  /**
   * Forgot password - Resend code to email.
  */
  forgotResendCode(reqData: any): Observable<any> {
    return this.httpClient.post(
      `${environment.url}Auth/Forgot/resendCode`,
      reqData
    );
  }

  /**
   * Verify email - Verify code sent to email.
  */
  verifyEmail(reqData: VerifyEmailReq): Observable<any> {
    return this.httpClient.post(
      `${environment.url}Auth/ValidateEmail/Validate`,
      reqData
    ).pipe(
      tap((res: any) => {
        if (res.data) {
          const data = res.data;
          if (data.accessToken) {
            this.saveTokens(data.accessToken, data.refreshToken);
            if (data.renewPassword) {
              localStorage.setItem('requiresPasswordReset', 'true');
            }
          }
        }
      })
    );
  }

  /**
   * Verify email - Resend code to email.
  */
  verifyEmailResendCode(reqData: TemporalLoginData): Observable<any> {
    return this.httpClient.post(
      `${environment.url}Auth/ValidateEmail/Resend`,
      reqData
    );
  }

  /**
   * 2fa - Send two-factor authentication code.
  */
  twoFactorAuth(reqData: VerifyEmailReq): Observable<any> {
    return this.httpClient.post(
      `${environment.url}Auth/2fa/Validate`,
      reqData
    ).pipe(
      tap((res: any) => {
        if (res.data) {
          const data = res.data;
          if (data.accessToken) {
            this.saveTokens(data.accessToken, data.refreshToken);
            if (data.renewPassword) {
              localStorage.setItem('requiresPasswordReset', 'true');
            }
          }
        }
      })
    );
  }
}
