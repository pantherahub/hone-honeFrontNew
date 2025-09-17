import { TestBed } from '@angular/core/testing';

import { OfficeDataService } from './office-data.service';

describe('OfficeDataService', () => {
  let service: OfficeDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfficeDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
