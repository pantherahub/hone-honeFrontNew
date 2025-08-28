import { inject, Injectable, Injector } from '@angular/core';
import { NzModalRef, NzModalService, ModalOptions } from 'ng-zorro-antd/modal';

@Injectable({
  providedIn: 'root'
})
export class AlertNzService {

  constructor(private modalService: NzModalService) { }

  private createModal(type: 'info' | 'success' | 'error' | 'warning', options: Partial<ModalOptions<any>>): NzModalRef {
    return this.modalService[type]({
      // nzOnOk:  () => {},
      ...options
    });
  }

  info(title: string, content: string, options?: Partial<ModalOptions<any>>): NzModalRef {
    return this.createModal('info', { nzTitle: title, nzContent: content, ...options });
  }

  success(title: string, content: string, options?: Partial<ModalOptions<any>>): NzModalRef {
    return this.createModal('success', { nzTitle: title, nzContent: content, ...options });
  }

  error(title: string = 'Oops...', content: string = 'Algo salió mal.', options?: Partial<ModalOptions<any>>): NzModalRef {
    return this.createModal('error', { nzTitle: title, nzContent: content, ...options });
  }

  warning(title: string, content: string, options?: Partial<ModalOptions<any>>): NzModalRef {
    return this.createModal('warning', { nzTitle: title, nzContent: content, ...options });
  }

  confirm(title: string, content: string, options?: Partial<ModalOptions<any>>): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.modalService.confirm({
        nzTitle: title,
        nzContent: content,
        nzOkText: 'Confirmar',
        nzCancelText: 'Cancelar',
        nzOkType: 'primary',
        nzOnOk: () => resolve(true),
        nzOnCancel: () => resolve(false),
        ...options
      });
    });
  }

  confirmDelete(title: string = '¿Está seguro?', content: string = 'Esta acción no se puede revertir.'): Promise<boolean> {
    return this.confirm(title, content, {
      nzOkType: 'primary',
      nzOkDanger: true
    });
  }
}
