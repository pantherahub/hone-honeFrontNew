import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackFivestarsComponent } from './feedback-fivestars.component';

describe('FeedbackFivestarsComponent', () => {
  let component: FeedbackFivestarsComponent;
  let fixture: ComponentFixture<FeedbackFivestarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackFivestarsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeedbackFivestarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
