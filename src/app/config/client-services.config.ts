import { ClientInterface } from "../interfaces/client.interface";
import { ServiceKey } from "./service-navigation.config";


export interface ServiceRule {
  key: ServiceKey;
  condition?: (client: ClientInterface) => boolean;
}


// Configuring access to services by client
export const clientServicesRules: Record<number, ServiceRule[]> = {
  8: [ // Axa
    { key: 'documentation' }, // Always allowed
    { key: 'contracts', condition: (c) => !!c?.withContract }
  ],
};
// 8: ['documentation', 'rates', 'contracts'],        // Axa rates
// 12: ['documentation', 'billing', 'rips'],          // BMI


// Services available to any other client
export const defaultServicesRules: ServiceRule[] = [
  { key: 'documentation' }
];
