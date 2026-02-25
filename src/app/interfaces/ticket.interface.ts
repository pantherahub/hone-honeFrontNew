export type MessageStatus = 'Approved' | 'Disapproved' | 'In process';

export interface TicketMessagePayload {
  message: string;
  archivo: File;
  idProviderLogin: number;
  idMessageStatus: number;
  sendEmail: boolean;
  email: string;
  showToClient: boolean;
  showToProvider: boolean;
  createIn: 'Lissom' | 'Provider' | 'Mixed';
  createdBy: 'HoneSolutions' | 'Provider' | 'Client';
}
