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
            this.saveToken(resp.token, resp.expir);
            this.saveUserLogged(resp.usuario);
            return resp;
         })
      );
   }

   // Guarda el token en el storage
   private saveToken (token: string, expiration: string) {
      if (token != null) {
         this.token = token;
         localStorage.setItem('token', token);
         localStorage.setItem('expire', expiration);
      } else {
         this.token = '';
      }
   }

   // Guarda en storage los datos del usuario logueado
   saveUserLogged (user: any) {
      localStorage.removeItem('userLogged');
      localStorage.setItem('userLogged', JSON.stringify(user));
      this.eventManager.userLogged.set(user);
   }

   // obtiene en token del local storage para validarlo
   public getStorageToken () {
      if (localStorage.getItem('token')) {
         const isToken: any = localStorage.getItem('token')!;
         this.token = isToken;
         return this.token;
      }
      return (this.token = '');
   }

   // Esta funcion valida fecha de expiracion del token, para dar acceso al sistema
   public isAuthenticated (): boolean {
      // return this.token.length > 0; // Eliminas esta linea y descomentar todas las de abajo

      this.getStorageToken();

      if (localStorage.getItem('token') && localStorage.getItem('expire')) {
         let res: boolean = true;
         const expirationDate = localStorage.getItem('expire')!;
         const today = new Date();
         const expiration = new Date(expirationDate.toString());
         if (today > expiration) {
            res = false;
            return res;
         }
         return res;
      } else {
         return false;
      }
   }

   // Llamar esta funcion en cualquier lado, para limpiar cache y cerrar sesión
   public logout () {
      localStorage.removeItem('token');
      localStorage.removeItem('expire');
      localStorage.removeItem('userLogged');
      localStorage.clear();
      this.router.navigateByUrl('login');
   }
}
