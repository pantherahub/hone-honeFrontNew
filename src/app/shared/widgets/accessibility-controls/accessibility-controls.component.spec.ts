import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessibilityControlsComponent } from './accessibility-controls.component';

describe('AccessibilityControlsComponent', () => {
  let component: AccessibilityControlsComponent;
  let fixture: ComponentFixture<AccessibilityControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessibilityControlsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccessibilityControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
