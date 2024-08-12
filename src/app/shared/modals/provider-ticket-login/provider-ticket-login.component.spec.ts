import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderTicketLoginComponent } from './provider-ticket-login.component';

describe('ProviderTicketLoginComponent', () => {
  let component: ProviderTicketLoginComponent;
  let fixture: ComponentFixture<ProviderTicketLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderTicketLoginComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProviderTicketLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
