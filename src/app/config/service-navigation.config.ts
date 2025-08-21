// Configuring access to services by client
export const clientServicesConfig: Record<number, string[]> = {
  8: ['documentation', 'rates'],            // Axa
  // 12: ['documentation', 'billing', 'rips'], // BMI
};

// Services available to any other client
export const defaultServices: string[] = ['documentation'];
