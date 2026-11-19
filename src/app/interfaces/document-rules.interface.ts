export type DocumentRulesOrigin = 'ADMIN' | 'PROVIDER';

export interface PolicyProviderTypeRule {
  name: string;
  idTypeProvider: number;
  smlvMainCities: number;
  smlvOtherCities: number;
}

/** Reglas de campos de documentos que entrega el API (GET Documents/Rules/:origin). */
export interface DocumentRules {
  origin: DocumentRulesOrigin;
  lists: {
    software: string[];
    softwareOtherOption: string;
    softwareOtherMaxLength: number;
    arlEntities: string[];
    policyCompanies: string[];
    mainCityIds: number[];
  };
  policyConfig: {
    smlv: number;
    byProviderType: PolicyProviderTypeRule[];
  };
  riskLevels: {
    default: string[];
    byDocumentType: { [idDocumentType: string]: string[] };
  };
}
