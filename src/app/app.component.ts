import { Component,effect } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterOutlet, ActivatedRoute, Router } from '@angular/router';
import { NgZorroModule } from './ng-zorro.module';
import { IconsProviderModule } from './icons-provider.module';
import { HeaderComponent } from './shared/header/header.component';
import { EventManagerService } from './services/events-manager/event-manager.service';

@Component({
   selector: 'app-root',
   standalone: true,
   imports: [ CommonModule, RouterOutlet, NgZorroModule, IconsProviderModule, HeaderComponent ],
   templateUrl: './app.component.html',
   styleUrl: './app.component.scss'
})
export class AppComponent {
   title = 'template-login';

   showMenu: boolean = this.eventManager.showMenu();
   // showMenu: boolean = false;

   constructor (private eventManager: EventManagerService, private readonly location: Location) {
      this.eventManager.getDataUser();
      this.eventManager.getDataClient();
      
      this.hideShowMenu();
      effect(() => {
         this.showMenu = this.eventManager.showMenu();
      });
   }

   hideShowMenu () {
      const url = this.location.path();
      if (url == '/login') {
         this.showMenu = false;
         this.eventManager.showMenu.set(false);
      } else {
         this.showMenu = true;
         this.eventManager.showMenu.set(true);
      }
   }
}
