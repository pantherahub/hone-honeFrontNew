import { TestBed } from '@angular/core/testing';

import { OfficeProviderService } from '../office-provider.service';

describe('OfficeProviderService', () => {
  let service: OfficeProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfficeProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
