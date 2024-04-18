import { TestBed } from '@angular/core/testing';

import { ContactsProviderServicesService } from './contacts-provider.services.service';

describe('ContactsProviderServicesService', () => {
  let service: ContactsProviderServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContactsProviderServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
