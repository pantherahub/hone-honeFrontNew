import { Injectable, Type } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { EventManagerService } from './events-manager/event-manager.service';
import { RefreshTokenResponse, TemporalLoginData, VerifyEmailReq } from '../models/auth.interface';
import { AuthUserState } from '../models/user-state.interface';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TwoFactorAuthContentComponent } from '../modules/public/two-factor-auth/two-factor-auth-content/two-factor-auth-content.component';
import { ValidatePasswordContentComponent } from '../modules/private/user/validate-password/validate-password-content/validate-password-content.component';
import { decodeJwtPayload } from '../utils/string-utils';

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
    private eventManager: EventManagerService,
    private modal: NzModalService,
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
    this.eventManager.clearUser();
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
    // if (token && this.isTokenValid(token)) {
    //   return true;
    // }
    // return false;
    return !!token;
  }

  getUserData(): AuthUserState | null {
    const user = localStorage.getItem("userLogged");
    return user ? JSON.parse(user) : null;
  }

  // Saves the logged-in user's data to storage
  saveUserLogged(user: AuthUserState) {
    this.eventManager.setUser(user);
  }

  loadUser(): Observable<any> {
    return this.httpClient.get(
      `${environment.url}Auth/GetUser`
    ).pipe(
      tap((res: any) => {
        if (!res || res.ok === false || !res.data) {
          throw new Error(res.message || 'Error al obtener el usuario');
        }

        const user = res.data.User;
        const userEmail = res.data.email;

        const providerData = user.UserHasProviders?.length
          ? user.UserHasProviders[0]
          : null;
        const clientData = user.UserHasClients?.length
          ? user.UserHasClients[0]
          : null;

        const source = providerData || clientData;
        if (!source) {
          throw new Error('El usuario no tiene asociados ni providers ni clients');
        }

        const role = source.OldRoleForProvider || source.OldRoleForClient;
        if (!role) {
          throw new Error('El usuario no tiene OldRoles asociados');
        }

        const provider = providerData?.Provider;
        const client = clientData?.Client;

        const userLogged: AuthUserState = {
          id: provider?.idProvider || null,
          email: provider?.email || null,
          name: provider?.razonSocial || null,
          withData: res.withData ?? false,
          rejected: res.rejected ?? false,
          doesNeedSurvey: res.doesNeedSurvey ?? false,
          roles: {
            description: role?.description,
            fullaccess: role?.fullaccess,
            idClientHoneSolutions: role?.idClientHoneSolutions,
            idRoles: role?.idRoles,
            nameRol: role?.nameRol,
            slug: role?.slug,
          },

          user: {
            idUser: user.idUser,
            names: user.names,
            lastNames: user.lastNames,
            fullName: `${user.names} ${user.lastNames}`,
            idTypeDocument: user.idTypeDocument,
            identification: user.identification,
            dv: user.dv,
            repsEnableCode: user.repsEnableCode,
            email: userEmail,
            avatar: user.avatar,

            Roles: res.data.Roles || [],
            Permissions: res.data.Permissions || [],
            provider: provider
              ? {
                  idProvider: provider.idProvider,
                  razonSocial: provider.razonSocial,
                  email: provider.email
                }
              : null,
            client: client
              ? {
                  idClientHoneSolutions: client.idClientHoneSolutions,
                  clientHoneSolutions: client.clientHoneSolutions
                }
              : null
          }
        };

        this.saveUserLogged(userLogged);
      }),
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

  isTokenValid(token: string): boolean {
    try {
      const payload = decodeJwtPayload(token);
      let now = Math.floor(Date.now() / 1000); // in secs
      return payload.exp > now;
    } catch (e) {
      return false;
    }
  }

  clearLocalStorage() {
    this.removeSession();
    this.removeTemporalLoginData();
    this.setTwoFactorAuthenticated(false);
    localStorage.removeItem('requires2fa');
    localStorage.removeItem('requiresEmailVerification');
    localStorage.removeItem('requiresPasswordReset');
    this.eventManager.clearClient();
    localStorage.removeItem('formState');
    localStorage.removeItem('tutorialStep');
    localStorage.removeItem('tutorialFinished');
  }

  private clearAuth() {
    this.clearLocalStorage();
    this.router.navigateByUrl('login');
  }

  public logout(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!this.isAuthenticated()) {
        this.clearAuth();
        resolve();
        return;
      }
      this.httpClient.post(
        `${environment.url}Auth/Logout`,
        null
      ).subscribe({
        next: (data: any) => {
          this.clearAuth();
          resolve();
        },
        error: (err: any) => {
          console.error(err);
          this.clearAuth();
          resolve();
        }
      });
    });
  }

  /**
   * Forgot password - Send email and request code.
  */
  forgotSendCode(reqData: any): Observable<any> {
    return this.httpClient.post(
      `${environment.url}Auth/ForgotPassword/SendCode`,
      reqData
    );
  }

  /**
   * Forgot password - Resend code to email.
  */
  forgotResendCode(reqData: any): Observable<any> {
    return this.httpClient.post(
      `${environment.url}Auth/ForgotPassword/ResendCode`,
      reqData
    );
  }

  /**
   * Forgot password - Verify code sent to email.
  */
  forgotVerifyCode(reqData: any): Observable<any> {
    return this.httpClient.post(
      `${environment.url}Auth/ForgotPassword/Validate`,
      reqData
    );
  }

  /**
   * Forgot password - Update password.
  */
  updatePasswordNoAuth(reqData: any): Observable<any> {
    return this.httpClient.put(
      `${environment.url}Auth/Security/ChangePassword/ApiKey`,
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
   * Update password with auth.
  */
  updatePasswordAuth(reqData: any): Observable<any> {
    return this.httpClient.put(
      `${environment.url}Auth/Security/ChangePassword/AccessToken`,
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

  /**
   * 2fa modal auth.
  */
  openAuthModal(with2FA: boolean): Observable<'success' | 'cancel'> {
    const componentToRender: Type<any> = with2FA
      ? TwoFactorAuthContentComponent
      : ValidatePasswordContentComponent;

    const modalRef = this.modal.create({
      nzContent: componentToRender,
      nzFooter: null,
    });

    return modalRef.afterClose as Observable<'success' | 'cancel'>;
  }
}
