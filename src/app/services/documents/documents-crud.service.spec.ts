import { TestBed } from '@angular/core/testing';

import { DocumentsCrudService } from './documents-crud.service';

describe('DocumentsCrudService', () => {
  let service: DocumentsCrudService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentsCrudService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
