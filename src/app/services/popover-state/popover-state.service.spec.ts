import { TestBed } from '@angular/core/testing';

import { PopoverStateService } from './popover-state.service';

describe('PopoverStateService', () => {
  let service: PopoverStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PopoverStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
