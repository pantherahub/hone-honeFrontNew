import { ClientBasicInfo } from "./client.interface";
import { Ticket } from "./ticket.interface";

export interface BaseContract {
  idContract: number;
  idContractType: number;
  expedientNumber: string;
  dateSignatureByClient: string | null;
  dateSignatureByProvider: string | null;

  Client: ClientBasicInfo;
  ContractType?: {
    idContractType: number;
    name: string;
  };
}

export interface Contract extends BaseContract {
  idTicket: number;
  idProvider: number;
  idClientHoneSolutions: number;
  createdAt: string;
  updatedAt: string;

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
