import { Component, OnInit } from '@angular/core';
import { ClientInterface } from '../../../models/client.interface';
import { ClientProviderService } from '../../../services/clients/client-provider.service';

import { NgZorroModule } from '../../../ng-zorro.module';
import { EventManagerService } from '../../../services/events-manager/event-manager.service';
import { Router } from '@angular/router';

@Component({
   selector: 'app-home',
   standalone: true,
   imports: [ NgZorroModule ],
   templateUrl: './home.component.html',
   styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
   clientList: ClientInterface[] = [];
   loadingData: boolean = false;

   user = this.eventManager.userLogged();

   constructor (
      private clientService: ClientProviderService,
      private eventManager: EventManagerService,
      private router: Router
   ) {
      localStorage.removeItem('clientSelected');
   }

   ngOnInit (): void {
      this.getClientList();
   }

   /**
    * Obtiene la lista de clientes del prestador que inicia sesión
    */
   getClientList () {
      this.loadingData = true;
      this.clientService.getClientListByProviderId(5926).subscribe({
         next: (res: any) => {
            console.log(res);
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
      console.log(item);
      localStorage.setItem('clientSelected', JSON.stringify(item));
      this.eventManager.getDataClient();
      this.router.navigateByUrl(`/cargar-documentos/${item.idClientHoneSolutions}`);
   }
}
