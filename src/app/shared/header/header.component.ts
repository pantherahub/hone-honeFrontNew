import { Component, inject, OnInit } from '@angular/core';

import { NgZorroModule } from '../../ng-zorro.module';
import { EventManagerService } from '../../services/events-manager/event-manager.service';

@Component({
   selector: 'app-header',
   standalone: true,
   imports: [ NgZorroModule ],
   templateUrl: './header.component.html',
   styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
   public eventManager = inject(EventManagerService);
   public user = this.eventManager.userLogged();

   constructor () {}

   ngOnInit (): void {}
}
