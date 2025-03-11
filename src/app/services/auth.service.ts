import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { EventManagerService } from './events-manager/event-manager.service';

@Injectable({
   providedIn: 'root'
})
export class AuthService {
  public url = environment.url;
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';

  constructor(
    private httpClient: HttpClient,
    private router: Router, private eventManager: EventManagerService
  ) { }

  login(reqData: any): Observable<any> {
    return this.httpClient.post(
      `${environment.url}Auth/Login`,
      reqData
    ).pipe(
      tap((res: any) => {
        if (res.ok) {
          const data = res.data;
          this.saveTokens(data.accessToken, data.refreshToken);
        }
      })
    );
  }

  saveTokens(accessToken: string, refreshToken: string | null = null) {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    if (!refreshToken) return;
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
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
      id: 3060,
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

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getUserData(): any | null {
    const user = localStorage.getItem("userLogged");
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token;
  }

  refreshAccessToken(): Observable<any> {
    return this.httpClient.post(
      `${environment.url}Auth/UpdateTokens`,
      { REFRESH_TOKEN: this.getRefreshToken() }
    ).pipe(
      tap((res: any) => {
        if (res.ok) {
          const newAccessToken = res.data.accessToken;
          const newRefreshToken = res.data.refreshToken;
          this.saveTokens(newAccessToken, newRefreshToken);
        }
      }),
      map((res: any) => res.data.accessToken || 'no hay nada'),
      // catchError((error) => {
      //   // Simulo token para no devolver el error
      //   const simulatedAccessToken = 'simulatedAccessToken';
      //   this.saveTokens(simulatedAccessToken, this.getRefreshToken());
      //   return of(simulatedAccessToken);
      // })
    );
  }

  removeSession() {
    localStorage.removeItem("userLogged");
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  public logout () {
    this.removeSession();
    localStorage.clear();
    this.router.navigateByUrl('login');
  }
}
