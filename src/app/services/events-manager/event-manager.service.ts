import { Injectable, signal } from '@angular/core';
import { UserInterface } from '../../models/user.interface';
import { ClientInterface } from 'src/app/models/client.interface';

@Injectable({
   providedIn: 'root'
})
export class EventManagerService {

  userLogged = signal<UserInterface>({});
  clientSelected = signal<ClientInterface>({});
  getPercentApi = signal<number>(0);

  constructor() { }

  /** Validar si existe un usuario en cache */
  public getDataUser() {
    if (localStorage.getItem('userLogged')) {
      const user = JSON.parse(localStorage.getItem('userLogged')!);
      this.userLogged.set(user);
    }
  }

  /** Validar si existe un cliente seleccionado en cache */
  public getDataClient() {
    if (localStorage.getItem('clientSelected')) {
      const client = JSON.parse(localStorage.getItem('clientSelected')!);
      this.clientSelected.set(client);
    }
  }

}
