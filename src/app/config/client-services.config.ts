import { ClientInterface } from "../interfaces/client.interface";
import { ServiceKey } from "./service-navigation.config";


export interface ServiceRule {
  key: ServiceKey;
  condition?: (client: ClientInterface) => boolean;
}


// Documentation always, contracts only when the client has them enabled
const documentationAndContractsRules: ServiceRule[] = [
  { key: 'documentation' }, // Always allowed
  { key: 'contracts', condition: (c) => !!c?.withContract }
];

// Configuring access to services by client
export const clientServicesRules: Record<number, ServiceRule[]> = {
  8: documentationAndContractsRules, // Axa
  15: documentationAndContractsRules, // Colsanitas
};
// 8: ['documentation', 'rates', 'contracts'],        // Axa rates
// 12: ['documentation', 'billing', 'rips'],          // BMI


// Services available to any other client
export const defaultServicesRules: ServiceRule[] = [
  { key: 'documentation' }
];
