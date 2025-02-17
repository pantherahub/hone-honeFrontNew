import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeModalComponent } from './office-modal.component';

describe('OfficeModalComponent', () => {
  let component: OfficeModalComponent;
  let fixture: ComponentFixture<OfficeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfficeModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OfficeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
