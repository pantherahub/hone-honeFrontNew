import { TemplateRef } from "@angular/core";

export type AlertVariant = 'info' | 'success' | 'danger' | 'warning';

export interface AlertOptions {
  title: string;
  message: string | TemplateRef<any>;
  messageHTML?: string;
  variant?: AlertVariant;
  isConfirmation?: boolean;
  showConfirmBtn?: boolean;
  showClose?: boolean;
  loading?: boolean;

  iconVariant?: AlertVariant;
  cancelBtnText?: string;
  confirmBtnText?: string;
  confirmBtnVariant?: 'primary' | 'gray' | 'red' | 'green';
  confirmBtnStyle?: 'solid' | 'soft' | 'ghost';
  customIconPath?: string;

  customSize?: string;
  closable?: boolean;
  beforeClose?: () => boolean | Promise<boolean>;
}
