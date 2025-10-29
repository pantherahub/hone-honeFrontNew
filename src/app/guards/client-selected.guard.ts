import { CanActivateFn, Router } from '@angular/router';
import { EventManagerService } from '../services/events-manager/event-manager.service';
import { inject } from '@angular/core';
import { ClientProviderService } from '../services/client-provider/client-provider.service';
import { catchError, map, of } from 'rxjs';

export const clientSelectedGuard: CanActivateFn = (route, state) => {
  const eventManager = inject(EventManagerService);
  const clientService = inject(ClientProviderService);
  const router = inject(Router);

  const selectedClient = eventManager.clientSelected();
  const user = eventManager.userLogged();

  if (!selectedClient || !selectedClient.idClientHoneSolutions) {
    return of(false);
  }

  return clientService.getClientListByProviderId(user.id).pipe(
    map((clientList: any[]) => {
      const clientIds = clientList.map(c => c.idClientHoneSolutions);
      const isValidClient = clientIds.includes(selectedClient.idClientHoneSolutions);

      if (!isValidClient) {
        // Selected client is not associated with the current provider.
        router.navigate(['/home']);
      }

      return isValidClient;
    }),
    catchError((err) => {
      router.navigate(['/home']);
      return of(false);
    })
  );

};
