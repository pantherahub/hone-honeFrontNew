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
  ContractType: ContractType;
  Provider: any;
  Ticket: Ticket;
}

export interface ContractType {
  idContractType: number;
  idClientHoneSolutions: number;
  name: string;
  nameTemplate: string;
  withRates: boolean;
  isActive: boolean;
  Attributes: ContractAttribute[];
}

export interface ContractAttribute {
  idAttribute: number;
  attributeLabel: string;
  attributeName: string;
  attributeTableAliases: string | null;
  attributeAutoComplete: string | null;
  attributeType: 'string' | 'number' | 'date' | 'boolean' | 'email' | 'select';
  isActive: boolean;
}

export interface ContractFilters {
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
