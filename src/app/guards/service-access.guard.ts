import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { EventManagerService } from '../services/events-manager/event-manager.service';
import { clientServicesConfig, defaultServices } from '../config/service-navigation.config';

export const serviceAccessGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const eventManager = inject(EventManagerService);

  const client = eventManager.clientSelected();
  const clientId = client?.idClientHoneSolutions;

  if (!client || !clientId) {
    return false;
  }


  const serviceKey = route.routeConfig?.path;

  const allowedServices = clientServicesConfig[clientId] ?? defaultServices;

  if (!allowedServices.includes(serviceKey!)) {
    router.navigate(['/home']);
    return false;
  }

  return true;
};
