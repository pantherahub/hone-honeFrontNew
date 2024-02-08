export interface ClientInterface {
   clientHoneSolutions?: string;
   idClientHoneSolutions?: number;
   url?: null;
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
   NameDocument?: string;
   UrlDocument?: string;
   nameDocument?: string;
   idTypeProvider?: number;
   idDocument?: number;
   idClientHoneSolutions?: number;
   dateAdd?: string;
   expirationDate?: string;
}
