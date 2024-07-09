import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponseCreateTicketComponent } from './response-create-ticket.component';

describe('ResponseCreateTicketComponent', () => {
  let component: ResponseCreateTicketComponent;
  let fixture: ComponentFixture<ResponseCreateTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResponseCreateTicketComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ResponseCreateTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
