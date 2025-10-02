import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventManagerService } from './events-manager/event-manager.service';

@Injectable({
   providedIn: 'root'
})
export class AuthService {
   public url = environment.url;
   private token: string = ''; // descomentar esta linea y eliminar linea 16

   constructor (private httpClient: HttpClient, private router: Router, private eventManager: EventManagerService) {}

   // Llama al api para iniciar sesión y solo se debe usar en el LoginComponent
   public login (user: any): Observable<any> {
      return this.httpClient.post(`${this.url}login`, user).pipe(
        map((resp: any) => {
          if (!resp.usuario || !resp.usuario.roles) {
            throw {
              status: 403,
              error: { message: 'El usuario no tiene roles asignados. Contacte con soporte.' }
            };
          }
          this.saveToken(resp.token);
          this.saveUserLogged(resp.usuario);
          return resp;
        })
      );
   }

   // Guarda el token en el storage
   private saveToken (token: string) {
      if (token != null) {
         this.token = token;
         localStorage.setItem('token', token);
      } else {
         this.token = '';
      }
   }

   // Guarda en storage los datos del usuario logueado
   saveUserLogged (user: any) {
      this.eventManager.setUser(user);
   }

   // obtiene en token del local storage para validarlo
   public getStorageToken() {
      const token = localStorage.getItem('token');
      if (token) {
         this.token = token;
         return this.token;
      }
      return (this.token = '');
   }

   // Esta funcion valida fecha de expiracion del token, para dar acceso al sistema
   public isAuthenticated (): boolean {
      const token = this.getStorageToken();
      if (token) {
        if (!this.isTokenValid(token)) {
          return false;
        }
        return true;
      }
      return false;
   }

  isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      let now = Math.floor(Date.now() / 1000); // in secs
      return payload.exp > now;
    } catch (e) {
      return false;
    }
  }

  clearLocalStorage() {
    localStorage.removeItem('token');
    localStorage.removeItem('expire');
    this.eventManager.clearUser();
    this.eventManager.clearClient();

    localStorage.removeItem('formState');
    localStorage.removeItem('tutorialStep');
    localStorage.removeItem('tutorialFinished');
  }

   // Llamar esta funcion en cualquier lado, para limpiar cache y cerrar sesión
   public logout () {
      this.clearLocalStorage();
      this.router.navigateByUrl('login');
   }
}
