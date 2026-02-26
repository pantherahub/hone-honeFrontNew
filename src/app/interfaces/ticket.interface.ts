export type MessageStatus = 'Approved' | 'Disapproved' | 'In process';
export type TicketMessageCreateIn = 'Lissom' | 'Provider' | 'Mixed';
export type TicketMessageCreateBy = 'HoneSolutions' | 'Provider' | 'Client';
export type TicketMessageStatusRef = 'In process' | 'Approved' | 'Disapproved';

export interface Ticket {
  idTickets: number;
  idStatus: number;
  idClientHoneSolutions: number;
  idTicketCreator: number;
  idTiposolicitud: number;
  fechaEdicion: string | null;
  fechaMaxima: string | null;
  fechaSolicitud: string | null;
  isNew: boolean;
  nombreSolicitud: string;
  observaciones: string;

  Messages?: TicketMessage[];
  Provider?: any;
  Providers?: any[];
  Status?: TicketStatus;
  TicketCreator?: any;
}

export interface TicketStatus {
  idStatus: number;
  isClosed: boolean;
  status: string;
}

export interface TicketMessage {
  idMessage: number;
  idMessageStatus: number;
  idProvider: number;
  message: string;
  isViewedByHone: boolean;
  type: string;
  showToClient: boolean;
  showToProvider: boolean;
  withCopy: boolean;
  withEmail: boolean;
  createdBy: TicketMessageCreateBy;
  createdAt: string;
  updatedAt: string;

  Emails: any[];
  Files: any[];
  MessageStatus: TicketMessageStatus;
  Provider: any;
  Tickets: Ticket[]
}

export interface TicketMessageStatus {
  idMessageStatus: number;
  name: TicketMessageStatusRef;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


/* Ticket message payloads */
export interface MessagesFilters {
  type: string;
  showToProvider: boolean;
  page: number;
  limit: number;
}
export interface TicketMessagePayload {
  message: string;
  archivo: File;
  idProviderLogin: number;
  idMessageStatus: number;
  sendEmail: boolean;
  email: string;
  showToClient: boolean;
  showToProvider: boolean;
  createIn: TicketMessageCreateIn;
  createdBy: 'HoneSolutions' | 'Provider' | 'Client';
}
export interface UpdateTicketMessagePayload {
  message: string;
  createIn: TicketMessageCreateIn;
}
export interface DeleteTicketMessagePayload {
  createIn: TicketMessageCreateIn;
  idProviderLogin: number;
}
