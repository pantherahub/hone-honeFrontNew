import { ClientBasicInfo } from "./client.interface";
import { BaseContract } from "./contract.interface";
import { StoredFile } from "./file.interface";

export type MessageStatus = 'Approved' | 'Disapproved' | 'In process';
export type TicketMessageType = 'Init' | 'Notification' | 'Message' | 'Closed';
export type TicketMessageCreatedIn = 'Lissom' | 'Provider' | 'Mixed';
export type TicketMessageCreateBy = 'HoneSolutions' | 'Provider' | 'Client' | 'AnonimClient' | 'AnonimProvider';
export type TicketMessageStatusRef = 'In process' | 'Approved' | 'Disapproved';

export interface Ticket {
  idTickets: number;
  idTicketParent: number | null;
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
  Involved?: any;

  Client?: ClientBasicInfo;
  RequestType?: TicketRequestType;
  Contract?: BaseContract;
}

export interface TicketRequestType {
  idTiposolicitud: number;
  nameSolicitud: string;
  isTicket: boolean;
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
  type: TicketMessageType;
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
export interface TicketFilters {
  idTicket?: number;
  idClientHoneSolutions?: number;
  idStatus?: number;
  startDate?: string;
  endDate?: string;
  requestName?: string;

  idProvider?: number; // DELETE
  idProviderCreator?: number;
  isNew?: boolean;

  // withParent?: boolean;
  // withChildren?: {
  //   status: boolean;
  //   last: boolean;
  // };

  messageOptions: {
    withMessages: boolean;
    idMessageStatus?: string;
    messageType?: TicketMessageType;
  };
  page: number;
  limit: number;
}
export interface MessageFilters {
  type: TicketMessageType;
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
