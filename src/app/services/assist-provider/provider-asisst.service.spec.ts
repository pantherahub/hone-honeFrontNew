import { TestBed } from '@angular/core/testing';

import { ProviderAsisstService } from './provider-asisst.service';

describe('ProviderAsisstService', () => {
  let service: ProviderAsisstService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProviderAsisstService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
