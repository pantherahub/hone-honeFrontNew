import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactTicketComponent } from './contact-ticket.component';

describe('ContactTicketComponent', () => {
  let component: ContactTicketComponent;
  let fixture: ComponentFixture<ContactTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactTicketComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContactTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
