import { ClientBasicInfo } from "./client.interface";
import { Ticket } from "./ticket.interface";

export interface Contract {
  idContract: number;
  idContractType: number;
  idTicket: number;
  idProvider: number;
  idClientHoneSolutions: number;
  expedientNumber: string;
  dateSignatureByClient: string | null;
  dateSignatureByProvider: string | null;
  createdAt: string;
  updatedAt: string;

  Client: ClientBasicInfo;
  ContractType: any;
  Provider: any;
  Ticket: Ticket;
}

export interface ContractsFilters {
  idProvider: number;
  idClientHoneSolutions: number;
  identification: number;
  expedientNumber?: string;
  idStatus?: number;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}
