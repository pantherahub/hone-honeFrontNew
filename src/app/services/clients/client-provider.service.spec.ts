import { TestBed } from '@angular/core/testing';

import { ClientProviderService } from './client-provider.service';

describe('ClientProviderService', () => {
  let service: ClientProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
