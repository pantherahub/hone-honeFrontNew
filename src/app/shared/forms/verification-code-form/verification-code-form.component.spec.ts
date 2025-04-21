import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificationCodeFormComponent } from './verification-code-form.component';

describe('VerificationCodeFormComponent', () => {
  let component: VerificationCodeFormComponent;
  let fixture: ComponentFixture<VerificationCodeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerificationCodeFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerificationCodeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
