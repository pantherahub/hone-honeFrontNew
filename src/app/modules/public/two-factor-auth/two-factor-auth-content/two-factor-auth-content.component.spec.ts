import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoFactorAuthContentComponent } from './two-factor-auth-content.component';

describe('TwoFactorAuthContentComponent', () => {
  let component: TwoFactorAuthContentComponent;
  let fixture: ComponentFixture<TwoFactorAuthContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TwoFactorAuthContentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TwoFactorAuthContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
