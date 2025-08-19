import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { clientSelectedGuard } from './client-selected.guard';

describe('clientSelectedGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => clientSelectedGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
