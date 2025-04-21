import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnableTwoFactorComponent } from './enable-two-factor.component';

describe('EnableTwoFactorComponent', () => {
  let component: EnableTwoFactorComponent;
  let fixture: ComponentFixture<EnableTwoFactorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnableTwoFactorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EnableTwoFactorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
