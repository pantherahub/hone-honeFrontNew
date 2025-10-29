import { Injectable } from '@angular/core';
import { AlertModalComponent } from 'src/app/shared/alerts/alert-modal/alert-modal.component';
import { ModalService } from '../modal/modal.service';
import { Observable } from 'rxjs';
import { AlertOptions } from 'src/app/models/alert.interface';
import { ModalRef } from 'src/app/models/modal.interface';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private modalService: ModalService) {}

  showAlert(opts: Partial<AlertOptions>): Observable<boolean | void> {
    const {
      customSize = 'max-w-xs',
      closable = true,
      showClose,
      beforeClose,
      ...alertOptions
    } = opts;

    const modalReturn: ModalRef = this.modalService.open(AlertModalComponent, {
      customSize,
      closable,
      beforeClose,
      customModalClass: '!rounded-lg !p-0',
    }, {
      showClose: showClose === undefined ? closable : showClose,
      ...alertOptions
    });

    return modalReturn.onClose;
  }

  info(title: string, message: string, options: Partial<AlertOptions> = {}): Observable<void> {
    return this.showAlert({ title, message, variant: 'info', ...options }) as Observable<void>;
  }

  success(title: string, message: string, options: Partial<AlertOptions> = {}): Observable<void> {
    return this.showAlert({ title, message, variant: 'success', ...options }) as Observable<void>;
  }

  error(title: string = 'Ups...', message: string = 'Algo salió mal.', options: Partial<AlertOptions> = {}): Observable<void> {
    return this.showAlert({ title, message, variant: 'danger', ...options }) as Observable<void>;
  }

  warning(title: string, message: string, options: Partial<AlertOptions> = {}): Observable<void> {
    return this.showAlert({ title, message, variant: 'warning', ...options }) as Observable<void>;
  }

  confirm(title: string, message: string, options: Partial<AlertOptions> = {}): Observable<boolean> {
    return this.showAlert({
      title,
      message,
      variant: options.variant ?? 'warning',
      isConfirmation: true,
      confirmBtnText: 'Confirmar',
      cancelBtnText: 'Cancelar',
      ...options
    }) as Observable<boolean>;
  }

  confirmUpdate(title: string = '¿Está seguro?', message: string = 'Esta acción no se puede deshacer.', options: Partial<AlertOptions> = {}): Observable<boolean> {
    return this.confirm(title, message, {
      variant: 'info',
      customIconPath: '/assets/icons/outline/general.svg#edit',
      ...options
    });
  }

  confirmDelete(title: string = '¿Está seguro?', message: string = 'Esta acción no se puede deshacer.', options: Partial<AlertOptions> = {}): Observable<boolean> {
    return this.confirm(title, message, {
      variant: 'danger',
      customIconPath: '/assets/icons/outline/general.svg#trash-bin',
      ...options
    });
  }

}
