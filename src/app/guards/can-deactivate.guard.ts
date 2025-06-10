import { CanDeactivateFn } from '@angular/router';
import { CanComponentDeactivate } from './can-deactivate.interface';

export const canDeactivateGuard: CanDeactivateFn<CanComponentDeactivate> = (component, currentRoute, currentState, nextState) => {
  return component.canDeactivate ? component.canDeactivate() : true;
};
