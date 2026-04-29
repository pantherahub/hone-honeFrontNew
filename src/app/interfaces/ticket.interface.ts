import { StoredFile } from "./file.interface";

export type MessageStatus = 'Approved' | 'Disapproved' | 'In process';
export type TicketMessageCreatedIn = 'Lissom' | 'Provider' | 'Mixed';
export type TicketMessageCreateBy = 'HoneSolutions' | 'Provider' | 'Client' | 'AnonimClient' | 'AnonimProvider';
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
  Managers?: any[];
  Status?: TicketStatus;
  TicketCreator?: any;
}

export interface TicketStatus {
  idStatus: number;
  status: string;
  color: string;
  isClosed: boolean;
  isSuccess: boolean;
  isClient: boolean;
}

export interface TicketMessage {
  idMessage: number;
  idMessageStatus: number;
  idProvider: number;
  message: string;
  isViewedByHone: boolean;
  type: string;
  createdBy: TicketMessageCreateBy;
  isUpdated: boolean;
  createdAt: string;
  updatedAt: string;

  MessageHasEmails: MessageEmail[];
  Files: StoredFile[];
  MessageStatus: TicketMessageStatus;
  Provider: any;
  Tickets: Ticket[];
}

export interface TicketMessageStatus {
  idMessageStatus: number;
  name: TicketMessageStatusRef;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageEmail {
  idMessageHasEmail: number;
  idMessage: number;
  idEmail: number;
  idTicketEmailTemplate: number;
  type: 'Provider' | 'Copy';
  Email: {
    idEmail: number;
    email: string;
    isActive: boolean;
  };
  TicketEmailTemplate: any;
}


/* Ticket message payloads */
export interface MessageFilters {
  type: string;
  page: number;
  limit: number;
  startDate?: string;
  endDate?: string;
  createdBy?: TicketMessageCreateBy;
}
export interface TicketMessagePayload {
  idMessageStatus: number;
  message: string;
  archivo: File;
  idProviderLogin: number;
  createdIn: TicketMessageCreatedIn;
  createdBy: TicketMessageCreateBy;
}
export interface UpdateTicketMessagePayload {
  message: string;
  createdIn: TicketMessageCreatedIn;
  idProviderLogin: number;
}
export interface DeleteTicketMessagePayload {
  createdIn: TicketMessageCreatedIn;
  idProviderLogin: number;
}
