import { Component, inject, OnInit } from '@angular/core';

import { NgZorroModule } from '../../ng-zorro.module';
import { EventManagerService } from '../../services/events-manager/event-manager.service';
import { AuthService } from '../../services/auth.service';

@Component({
   selector: 'app-header',
   standalone: true,
   imports: [ NgZorroModule ],
   templateUrl: './header.component.html',
   styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
   public eventManager = inject(EventManagerService);
   public authService = inject(AuthService);
   public user = this.eventManager.userLogged();
   visible: boolean = false;

   constructor () {}

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
