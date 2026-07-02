import { ClientBasicInfo } from "./client.interface";
import { BaseContract } from "./contract.interface";
import { StoredFile } from "./file.interface";

export type MessageStatus = 'Approved' | 'Disapproved' | 'In process';
export type TicketMessageType = 'Init' | 'Notification' | 'Message' | 'Closed';
export type TicketMessageCreatedIn = 'Lissom' | 'Provider' | 'Mixed';
export type TicketMessageCreatedBy = 'HoneSolutions' | 'Provider' | 'Client' | 'AnonimClient' | 'AnonimProvider';
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
  idRequestType?: number;
  nameSolicitud: string;
  isTicket: boolean;
  withClient?: boolean;
  isProvider?: boolean;
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
  createdBy: TicketMessageCreatedBy;
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

export interface TicketEscalation {
  clientHoneSolutions: string;
  idClientHoneSolutions: number;
  dateRequest: string;
}


/* Ticket message payloads */
export interface TicketFilters {
  idTicket?: number;
  idClientHoneSolutions?: number;
  idStatus?: number;
  startDate?: string;
  endDate?: string;
  requestName?: string;

  idProvider?: number;
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
  createdBy?: TicketMessageCreatedBy;
}
export interface CreateTicketPayload {
  createdBy: TicketMessageCreatedBy;
  idProviderManager: number;
  idProviderLogin?: number;
  idProvider?: number;
  idClientHoneSolutions: number;
  idRequestType: number;
  requestName: string;
  message: string;
  dateMax: string;
  dataCreator?: {
    name: string;
    lastname: string;
    email: string;
    phone: string;
    idTypeDocument: number;
    identification: string;
  }; // Anonymous creators
  // idTicketParent?: number;
  // copy?: string[];
  archivo?: File[];
}
export interface TicketMessagePayload {
  idMessageStatus: number;
  message: string;
  archivo: File | File[] | null;
  idProviderLogin: number;
  createdIn: TicketMessageCreatedIn;
  createdBy: TicketMessageCreatedBy;
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
