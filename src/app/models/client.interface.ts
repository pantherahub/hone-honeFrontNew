export interface ClientInterface {
   clientHoneSolutions?: string;
   idClientHoneSolutions?: number;
   url?: string;
   urlHeader?: string;
   idProvider?: number;
   identificacion?: string;
   razonSocial?: string;
   typeProvider?: string;
   idTypeProvider?: number;
   email?: string;
}

export interface PercentInterface {
   uploaded?: number;
   expired?: number;
   remaining?: number;
   total?: number;
}

export interface DocumentInterface {
   idProvider?: string;
   typeDocument?: string;
   UrlDocument?: string;
   nameDocument?: string;
   idTypeProvider?: number;
   // idDocument?: number;
   idDocumentType?: number;
   idClientHoneSolutions?: number;
   dateAdd?: string;
   expirationDate?: string;
}

export interface CompanyInterface {
  idCompany: number;
  idClientHoneSolutions?: number | null;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}
