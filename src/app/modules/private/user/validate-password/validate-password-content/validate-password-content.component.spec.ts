import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidatePasswordContentComponent } from './validate-password-content.component';

describe('ValidatePasswordContentComponent', () => {
  let component: ValidatePasswordContentComponent;
  let fixture: ComponentFixture<ValidatePasswordContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidatePasswordContentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValidatePasswordContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
