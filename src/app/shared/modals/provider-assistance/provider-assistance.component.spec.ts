import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderAssistanceComponent } from './provider-assistance.component';

describe('ProviderAssistanceComponent', () => {
  let component: ProviderAssistanceComponent;
  let fixture: ComponentFixture<ProviderAssistanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderAssistanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProviderAssistanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
