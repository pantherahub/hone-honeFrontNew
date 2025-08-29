import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { serviceAccessGuard } from './service-access.guard';

describe('serviceAccessGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => serviceAccessGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
