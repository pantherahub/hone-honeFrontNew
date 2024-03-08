import { Component, OnInit, effect } from '@angular/core';
import { ClientInterface } from '../../../models/client.interface';
import { ClientProviderService } from '../../../services/clients/client-provider.service';

import { NgZorroModule } from '../../../ng-zorro.module';
import { EventManagerService } from '../../../services/events-manager/event-manager.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
   selector: 'app-home',
   standalone: true,
   imports: [ NgZorroModule, CommonModule ],
   templateUrl: './home.component.html',
   styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
   clientList: ClientInterface[] = [];
   loadingData: boolean = false;

   defaultImageUrl: string = '../../../../assets/img/no-foto.png';

   user = this.eventManager.userLogged();

   constructor (
      private clientService: ClientProviderService,
      private eventManager: EventManagerService,
      private router: Router
   ) {
      localStorage.removeItem('clientSelected');
      this.eventManager.clientSelected.set({});
   }

   ngOnInit (): void {
      this.getClientList();
   }

   /**
    * Obtiene la lista de clientes del prestador que inicia sesión
    */
   getClientList () {
      this.loadingData = true;
      this.clientService.getClientListByProviderId(this.user.id).subscribe({
         next: (res: any) => {
            this.clientList = res;
            this.loadingData = false;
         },
         error: (error: any) => {
            this.loadingData = false;
         },
         complete: () => {}
      });
   }

   /**
    * Redirecciona a la lista de documentos por cargar del cliente seleccionado
    */
   changeOptionClient (item: any) {
      localStorage.setItem('clientSelected', JSON.stringify(item));
      this.eventManager.getDataClient();
      this.router.navigateByUrl(`/cargar-documentos/${item.idClientHoneSolutions}`);
   }
}
