export type TypeDisclaimer = 'Cliente' | 'General';

export interface Disclaimer {
  idDisclaimer: number;
  idClientHoneSolutions: number;
  type: TypeDisclaimer;
  message: string;
  withObservations: boolean;
  module: string;
  isActive: boolean;
  fileUrl: string;
  showPeriodInMonths: string;
  ClientHoneSolution: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDisclaimerResponsePayload {
  idDisclaimer: number;
  idProvider: number;
  isApproved: boolean;
  observations?: string;
}
