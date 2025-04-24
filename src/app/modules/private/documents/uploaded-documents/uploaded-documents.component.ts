import { Component, OnInit } from '@angular/core';
import { EventManagerService } from '../../../../services/events-manager/event-manager.service';
import { DocumentsCrudService } from '../../../../services/documents/documents-crud.service';
import { DocumentInterface } from '../../../../models/client.interface';
import { CommonModule } from '@angular/common';
import { NgZorroModule } from '../../../../ng-zorro.module';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { PipesModule } from '../../../../pipes/pipes.module';

import { ModalEditDocumentComponent } from '../modal-edit-document/modal-edit-document.component';
import { FileViewerComponent } from 'src/app/shared/modals/file-viewer/file-viewer.component';

@Component({
   selector: 'app-uploaded-documents',
   standalone: true,
   imports: [ CommonModule, NgZorroModule, PipesModule, FileViewerComponent ],
   templateUrl: './uploaded-documents.component.html',
   styleUrl: './uploaded-documents.component.scss'
})
export class UploadedDocumentsComponent implements OnInit {
   loadingData: boolean = false;
   clientSelected: any = this.eventManager.clientSelected();
   counterApi: any = this.eventManager.getPercentApi();
   documentList: DocumentInterface[] = [];

   previewVisible: boolean = false;
   currentItem: DocumentInterface = {};

   constructor (
      private eventManager: EventManagerService,
      private documentService: DocumentsCrudService,
      private modalService: NzModalService,
      private notificationService: NzNotificationService
   ) {}

   ngOnInit (): void {
      this.getUploadedDocuments();
   }

   /**
    * Obtiene el listado de documentos cargados
    */
   getUploadedDocuments () {
      this.loadingData = true;
      const { idProvider, idTypeProvider, idClientHoneSolutions } = this.clientSelected;
      this.documentService.getUploadedDocuments(idProvider, idTypeProvider, idClientHoneSolutions).subscribe({
         next: (res: any) => {
            this.loadingData = false;
            if (res) {
               this.documentList = res;
            } else {
               this.documentList = [];
            }
         },
         error: (error: any) => {
            this.documentList = [];
            this.loadingData = false;
         },
         complete: () => {}
      });
   }

   /**
    * Eliminar un archivo
    * @param file - recibe el archivo para eliminar
    * @param item - elemento de la lista para saber cual documento de carga ej (cedula, nit, rethus)
    */
   deleteDocument (item: any) {
      const { idDocumentsProvider } = item;

      this.modalService.warning({
         nzTitle: '¿Estas seguro de eliminar el documento?',
         nzContent: '<b>En caso de eliminar el documento se perderá y no podrá recuperarse</b>',
         nzOkText: 'Si',
         nzCancelText: 'No',
         nzOnOk: () => {
            this.loadingData = true;
            this.documentService.deleteDocument(idDocumentsProvider).subscribe({
               next: (res: any) => {
                  this.loadingData = false;
                  this.getUploadedDocuments();
                  this.eventManager.getPercentApi.set(this.counterApi + 1);
                  this.createNotificacion('success', 'Documento eliminado', 'El documento se eliminó correctamente.');
               },
               error: (error: any) => {
                  this.loadingData = false;
                  this.createNotificacion('error', 'Error', 'Lo sentimos, no se pudo eliminar el documento.');
               },
               complete: () => {}
            });
         }
      });
   }

   /**
    * Muestra la previsualizacion de un archivo en una modal
    * @param item - elemento de la lista para saber cual documento de carga ej (cedula, nit, rethus)
    */
   viewFile (item: any) {
      this.resetValues();
      if (item.UrlDocument) {
         this.currentItem = item;
         this.openViewerModal();
      }
   }

   openViewerModal() {
      this.previewVisible = true;
   }

   closeViewerModal() {
      this.previewVisible = false;
      this.resetValues();
   }

   /**
    * Reinicia los valores del item e imagen seleccionados para visualizar
    */
   resetValues () {
      this.currentItem = {};
   }

   /**
    * Abre una ventana modal para las confirmaciones de peticion
    * @param message - recibe el mensaje que se mostrará en pantalla
    * @param documentType - recibe el tipo de documento que desea editar
    */
   editDocumentModal (item: any): void {
      const modal = this.modalService.create<ModalEditDocumentComponent, any>({
         nzContent: ModalEditDocumentComponent,
         nzCentered: true,
         nzClosable: true,
         nzTitle: 'Actualizar información',
         nzFooter: null,
         nzStyle: { 'max-width': '90%' }
      });
      const instance = modal.getContentComponent();

      instance.currentDoc = item;
      instance.documentId = item.idDocumentsProvider;
      instance.documentType = item.idTypeDocuments;

      // Return a result when opened
      modal.afterOpen.subscribe(() => {});
      // Return a result when closed
      modal.afterClose.subscribe((result: any) => {
         if (result) {
            if (result.response) {
               this.getUploadedDocuments();
            }
         }
      });
   }

   /**
    * Crea una notificacion de alerta
    * @param type - string recibe el tipo de notificacion (error, success, warning, info)
    * @param title - string recibe el titulo de la notificacion
    * @param message - string recibe el mensaje de la notificacion
    */
   createNotificacion (type: string, title: string, message: string) {
      this.notificationService.create(type, title, message);
   }
}
