import { ServiceKey } from "./client-services.config";

// Configuring access to services by client
export const clientServicesConfig: Record<number, ServiceKey[]> = {
  // 8: ['documentation'],            // Axa
  8: ['documentation', 'rates'],            // Axa
  // 12: ['documentation', 'billing', 'rips'], // BMI
  // 13: ['documentation', 'rates', 'billing', 'rips'], // Sura TEST
};

// Services available to any other client
export const defaultServices: ServiceKey[] = ['documentation'];
