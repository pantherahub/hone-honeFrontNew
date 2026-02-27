import { ServiceKey } from "./service-navigation.config";

// Configuring access to services by client
export const clientServicesConfig: Record<number, ServiceKey[]> = {
  8: ['documentation', 'contracts'],                    // Axa
  // 8: ['documentation', 'rates', 'contracts'],        // Axa rates
  // 12: ['documentation', 'billing', 'rips'],          // BMI
  // 13: ['documentation', 'rates', 'billing', 'rips', 'contracts'], // Sura TEST
};

// Services available to any other client
export const defaultServices: ServiceKey[] = ['documentation'];
