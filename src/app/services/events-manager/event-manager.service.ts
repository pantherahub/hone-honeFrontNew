import { Injectable, signal } from '@angular/core';
import { AuthUserState } from '../../models/user-state.interface';
import { ClientInterface } from 'src/app/models/client.interface';

@Injectable({
   providedIn: 'root'
})
export class EventManagerService {

  // Signals
  userLogged = signal<AuthUserState>({});
  clientSelected = signal<ClientInterface>({});
  viewMode = signal<'grid' | 'list' | null>(null);

  private readonly viewModeKey = 'clientViewMode';
  private readonly userKey = 'userLogged';
  private readonly clientKey = 'clientSelected';

  constructor() {
    this.initFromStorage();
  }

  /** Initializes all signals from localStorage if they exist */
  private initFromStorage(): void {
    // User
    const savedUser = localStorage.getItem(this.userKey);
    if (savedUser) {
      this.userLogged.set(JSON.parse(savedUser));
    }

    // Selected client
    const savedClient = localStorage.getItem(this.clientKey);
    if (savedClient) {
      this.clientSelected.set(JSON.parse(savedClient));
    }

    // Client view mode
    const savedViewMode = localStorage.getItem(this.viewModeKey) as 'grid' | 'list' | null;
    if (savedViewMode) {
      this.viewMode.set(savedViewMode);
    }
  }


  // User
  setUser(user: AuthUserState) {
    this.userLogged.set(user);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }
  clearUser() {
    this.userLogged.set({});
    localStorage.removeItem(this.userKey);
  }

  // Selected client
  setClient(client: ClientInterface) {
    this.clientSelected.set(client);
    localStorage.setItem(this.clientKey, JSON.stringify(client));
  }
  clearClient() {
    this.clientSelected.set({});
    localStorage.removeItem(this.clientKey);
  }

  // Selected client view mode in home
  setViewMode(mode: 'grid' | 'list') {
    this.viewMode.set(mode);
    localStorage.setItem(this.viewModeKey, mode);
  }
  clearViewMode() {
    this.viewMode.set(null);
    localStorage.removeItem(this.viewModeKey);
  }

}
