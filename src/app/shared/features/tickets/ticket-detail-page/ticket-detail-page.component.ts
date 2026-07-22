import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Ticket } from 'src/app/interfaces/ticket.interface';
import { AuthService } from 'src/app/services/auth.service';
import { ButtonComponent } from 'src/app/shared/ui/buttons/button/button.component';
import { TicketContentComponent } from 'src/app/shared/features/tickets/ticket-content/ticket-content.component';
import { AlertComponent } from 'src/app/shared/ui/feedback/alert/alert.component';

@Component({
  selector: 'app-ticket-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    TicketContentComponent,
    AlertComponent,
  ],
  templateUrl: './ticket-detail-page.component.html',
  styleUrl: './ticket-detail-page.component.scss'
})
export class TicketDetailPageComponent implements OnInit {

  idTicket: number | null = null;
  ticket: Ticket | null = null;
  isLogged: boolean = false;
  creatorIdentification: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private location: Location,
  ) { }

  ngOnInit(): void {
    this.isLogged = this.authService.isAuthenticated();
    this.creatorIdentification = this.route.snapshot.queryParamMap.get('identification');

    const idTicketParam = this.route.snapshot.paramMap.get('idTicket');
    const idTicket = Number(idTicketParam);
    this.idTicket = Number.isFinite(idTicket) && idTicket > 0
      ? idTicket
      : null;
  }

  goBack() {
    this.location.back();
  }

  goToTickets() {
    this.router.navigateByUrl('tickets', { replaceUrl: true });
  }

  onTicketChange(ticket: Ticket | null) {
    this.ticket = ticket;
  }

}
