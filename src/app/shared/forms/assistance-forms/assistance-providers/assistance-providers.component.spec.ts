import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssistanceProvidersComponent } from './assistance-providers.component';

describe('AssistanceProvidersComponent', () => {
  let component: AssistanceProvidersComponent;
  let fixture: ComponentFixture<AssistanceProvidersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssistanceProvidersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssistanceProvidersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
