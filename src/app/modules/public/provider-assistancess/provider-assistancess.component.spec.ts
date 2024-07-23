import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderAssistancessComponent } from './provider-assistancess.component';

describe('ProviderAssistancessComponent', () => {
  let component: ProviderAssistancessComponent;
  let fixture: ComponentFixture<ProviderAssistancessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderAssistancessComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProviderAssistancessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
