import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisableTwoFactorComponent } from './disable-two-factor.component';

describe('DisableTwoFactorComponent', () => {
  let component: DisableTwoFactorComponent;
  let fixture: ComponentFixture<DisableTwoFactorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisableTwoFactorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DisableTwoFactorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
