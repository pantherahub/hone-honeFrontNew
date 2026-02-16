import { Injectable, signal } from '@angular/core';
import { AuthUserState } from 'src/app/models/user-state.interface';
import { ClientInterface } from 'src/app/models/client.interface';
import { StorageKey } from 'src/app/enums/storage-key.enum';

@Injectable({
   providedIn: 'root'
})
export class EventManagerService {

  // Signals
  userLogged = signal<AuthUserState>({});
  clientSelected = signal<ClientInterface>({});
  viewMode = signal<'grid' | 'list' | null>(null);

  isEditingProvider = signal<boolean>(false);

  private readonly USER_KEY = StorageKey.UserLogged;
  private readonly CLIENT_KEY = StorageKey.ClientSelected;
  private readonly VIEW_MODE_KEY = StorageKey.ViewMode;

  constructor() {
    this.initFromStorage();
  }

  /** Initializes all signals from localStorage if they exist */
  private initFromStorage(): void {
    // User
    const savedUser = localStorage.getItem(this.USER_KEY);
    if (savedUser) {
      this.userLogged.set(JSON.parse(savedUser));
    }

    // Selected client
    const savedClient = localStorage.getItem(this.CLIENT_KEY);
    if (savedClient) {
      this.clientSelected.set(JSON.parse(savedClient));
    }

    // Client view mode
    const allowedModes = ['grid', 'list'];
    const savedViewMode = localStorage.getItem(this.VIEW_MODE_KEY);
    if (savedViewMode && allowedModes.includes(savedViewMode)) {
      this.viewMode.set(savedViewMode as 'grid' | 'list');
    } else {
      this.viewMode.set(null);
    }
  }


  // User
  setUser(user: AuthUserState) {
    this.userLogged.set(user);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
  clearUser() {
    this.userLogged.set({});
    localStorage.removeItem(this.USER_KEY);
  }

  // Selected client
  setClient(client: ClientInterface) {
    this.clientSelected.set(client);
    localStorage.setItem(this.CLIENT_KEY, JSON.stringify(client));
  }
  clearClient() {
    this.clientSelected.set({});
    localStorage.removeItem(this.CLIENT_KEY);
  }

  // Selected client view mode in home
  setViewMode(mode: 'grid' | 'list') {
    this.viewMode.set(mode);
    localStorage.setItem(this.VIEW_MODE_KEY, mode);
  }
  clearViewMode() {
    this.viewMode.set(null);
    localStorage.removeItem(this.VIEW_MODE_KEY);
  }

  // Status of a form update in the update-data module
  startEditingProvider() {
    this.isEditingProvider.set(true);
  }
  stopEditingProvider() {
    this.isEditingProvider.set(false);
  }

}
