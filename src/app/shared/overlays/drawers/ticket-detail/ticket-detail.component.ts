import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Ticket } from 'src/app/interfaces/ticket.interface';
import { DrawerComponent } from 'src/app/shared/ui/overlays/drawer/drawer.component';
import { TicketContentComponent, TICKET_STATUS_CONFIG } from 'src/app/shared/features/tickets/ticket-content/ticket-content.component';
import { BadgeConfig } from 'src/app/types/badge-config.type';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [
    CommonModule,
    DrawerComponent,
    TicketContentComponent,
  ],
  templateUrl: './ticket-detail.component.html',
  styleUrl: './ticket-detail.component.scss'
})
export class TicketDetailComponent {

  @Input() statusConfig: Record<string, BadgeConfig> = TICKET_STATUS_CONFIG;
  @Output() refreshList = new EventEmitter<void>();

  idTicket: number | null = null;
  ticket: Ticket | null = null;

  @ViewChild('ticketDrawer') ticketDrawer!: DrawerComponent;
  @ViewChild('ticketContent') ticketContent!: TicketContentComponent;

  open(idTicket: number) {
    this.idTicket = idTicket;
    this.ticket = null;
    this.ticketDrawer.open();
    this.ticketContent.open(idTicket);
  }

  close() {
    this.ticketContent?.close();
    this.ticketDrawer.close();
  }

  canClose(): Promise<boolean> | boolean {
    return this.ticketContent?.canClose() ?? true;
  }

  onDrawerInternalClose() {
    this.ticketContent?.handleContainerClose();
    this.refreshList.emit();
  }

  onTicketChange(ticket: Ticket | null) {
    this.ticket = ticket;
  }

  onLoadError() {
    this.close();
  }

}
