import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiselectTestComponent } from './multiselect-test.component';

describe('MultiselectTestComponent', () => {
  let component: MultiselectTestComponent;
  let fixture: ComponentFixture<MultiselectTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiselectTestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MultiselectTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
