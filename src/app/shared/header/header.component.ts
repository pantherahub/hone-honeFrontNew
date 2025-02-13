import { Component, inject, OnInit, effect } from '@angular/core';
import { NgZorroModule } from '../../ng-zorro.module';
import { EventManagerService } from '../../services/events-manager/event-manager.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
   selector: 'app-header',
   standalone: true,
   imports: [ NgZorroModule, CommonModule, RouterModule ],
   templateUrl: './header.component.html',
   styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  public eventManager = inject(EventManagerService);
  public authService = inject(AuthService);
  public user = this.eventManager.userLogged();
  visible: boolean = false;

  constructor () {
    // effect(() => {
    //    this.user = this.eventManager.userLogged();
    // });
  }

  ngOnInit (): void {}

  /**
  * Hace visible el menú
  */
  clickMe (): void {
    this.visible = false;
  }

  change (value: boolean): void {}

  /**
  * Llama el servicio de auth para cerrar sesión
  */
  logout () {
    this.authService.logout();
  }
}
