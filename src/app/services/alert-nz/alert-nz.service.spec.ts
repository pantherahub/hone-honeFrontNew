import { TestBed } from '@angular/core/testing';

import { AlertNzService } from './alert-nz.service';

describe('AlertNzService', () => {
  let service: AlertNzService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertNzService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
