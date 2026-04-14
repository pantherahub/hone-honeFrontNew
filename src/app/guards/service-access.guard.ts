import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { EventManagerService } from '../services/events-manager/event-manager.service';
import { clientServicesRules, defaultServicesRules } from '../config/client-services.config';

export const serviceAccessGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const eventManager = inject(EventManagerService);

  const client = eventManager.clientSelected();
  const clientId = client?.idClientHoneSolutions;

  if (!client || !clientId) {
    return false;
  }

  const serviceKey = route.data?.['serviceKey'];
  if (!serviceKey) return false;

  const rules = clientServicesRules[clientId] ?? defaultServicesRules;
  const isAllowed = rules.some(rule =>
    rule.key === serviceKey && (!rule.condition || rule.condition(client))
  );

  if (!isAllowed) {
    router.navigate(['/home']);
    return false;
  }

  return true;
};
