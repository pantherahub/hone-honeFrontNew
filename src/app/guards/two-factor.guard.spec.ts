import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { twoFactorGuard } from './two-factor.guard';

describe('twoFactorGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => twoFactorGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
