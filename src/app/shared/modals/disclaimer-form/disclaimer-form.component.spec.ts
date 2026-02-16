import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisclaimerFormComponent } from './disclaimer-form.component';

describe('DisclaimerFormComponent', () => {
  let component: DisclaimerFormComponent;
  let fixture: ComponentFixture<DisclaimerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisclaimerFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DisclaimerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
