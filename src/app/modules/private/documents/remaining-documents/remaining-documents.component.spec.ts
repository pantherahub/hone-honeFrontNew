import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemainingDocumentsComponent } from './remaining-documents.component';

describe('RemainingDocumentsComponent', () => {
  let component: RemainingDocumentsComponent;
  let fixture: ComponentFixture<RemainingDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemainingDocumentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RemainingDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
