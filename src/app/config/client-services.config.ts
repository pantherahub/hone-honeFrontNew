export const SERVICES_CONFIG = {
  documentation: {
    key: 'documentation',
    path: '/service/documentation',
    label: 'Documentación',
    tab: 'Documentos',
  },
  rates: {
    key: 'rates',
    path: '/service/rates',
    label: 'Tarifas',
    tab: 'Tarifas',
  },
  // billing: {
  //   key: 'billing',
  //   path: '/service/billling',
  //   label: 'Facturación',
  //   tab: 'Facturación',
  // },
  // rips: {
  //   key: 'rips',
  //   path: '/service/rips',
  //   label: 'Rips',
  //   tab: 'RIPS',
  // },
} as const;

export type ServiceKey = keyof typeof SERVICES_CONFIG;
export type ServiceConfig = (typeof SERVICES_CONFIG)[ServiceKey];

// Order in which services appear in the navigation UI
export const SERVICES_ORDER: readonly ServiceKey[] = [
  'documentation',
  'rates',
  // 'billing',
  // 'rips',
];
