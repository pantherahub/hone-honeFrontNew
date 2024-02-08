import { Component, OnInit, NgModule } from '@angular/core';
import { EventManagerService } from '../../../../services/events-manager/event-manager.service';
import { DocumentsCrudService } from '../../../../services/documents/documents-crud.service';
import { DocumentInterface } from '../../../../models/client.interface';
import { CommonModule } from '@angular/common';
import { NgZorroModule } from '../../../../ng-zorro.module';
import { NzModalService } from 'ng-zorro-antd/modal';
import { PipesModule } from '../../../../pipes/pipes.module';

import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ModalEditDocumentComponent } from '../modal-edit-document/modal-edit-document.component';

@Component({
   selector: 'app-uploaded-documents',
   standalone: true,
   imports: [ CommonModule, NgZorroModule, PipesModule, PdfViewerModule ],
   templateUrl: './uploaded-documents.component.html',
   styleUrl: './uploaded-documents.component.scss'
})
export class UploadedDocumentsComponent implements OnInit {
   loading: boolean = false;
   clientSelected: any = this.eventManager.clientSelected();
   counterApi: any = this.eventManager.getPercentApi();

   loadingData: boolean = false;
   previewVisible: boolean = false;
   isImage: boolean = false;
   previewFile: string = '';
   currentItem: DocumentInterface = {};

   documentList: DocumentInterface[] = [];

   typeImageExtension = [ 'jpg', 'jpeg', 'webb', 'gif', 'tiff', 'tif', 'bmp', 'raw', 'png', 'jfif' ];

   constructor (
      private eventManager: EventManagerService,
      private documentService: DocumentsCrudService,
      private modalService: NzModalService
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
            console.log('getUploadedDocuments: ', res);
            this.loadingData = false;
            if (res) {
               this.documentList = res;
            } else {
               this.documentList = [];
            }
         },
         error: (error: any) => {
            this.loadingData = false;
         },
         complete: () => {}
      });
   }

   /**
    * Carga un archivo y lo envia al api de carga de documentos
    * @param event - evento del input que contiene el archivo para cargar
    * @param item - elemento de la lista para saber cual documento de carga ej (cedula, nit, rethus)
    */
   loadFiles (event: any, item: any) {
      if (event.target.files.length > 0) {
         const file: FileList = event.target.files[0];
         this.uploadDocuments(file, item);
      }
   }

   /**
    * Carga un archivo y lo envia al api de carga de documentos
    * @param file - recibe el archivo para cargar
    * @param item - elemento de la lista para saber cual documento de carga ej (cedula, nit, rethus)
    */
   uploadDocuments (file: any, item: any) {
      this.loadingData = true;
      const { idProvider } = this.clientSelected;
      const today = new Date();
      const fileToUpload = new FormData();
      fileToUpload.append('archivo', file);
      const body = {
         posicion: 0,
         nombre: file.name,
         documento: item.idDocument,
         nombredcoumentos: item.NameDocument,
         fechavencimiento: today,
         idUser: idProvider
      };
      fileToUpload.append('datos', JSON.stringify(body));

      this.documentService.uploadDocuments(idProvider, fileToUpload).subscribe({
         next: (res: any) => {
            this.loadingData = false;
            this.getUploadedDocuments();
         },
         error: (error: any) => {
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
               },
               error: (error: any) => {
                  this.loadingData = false;
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
         const array = item.UrlDocument.split('.');
         const extension = array[array.length - 1];

         const resp = this.typeImageExtension.find((item: any) => item == extension.toString());
         if (resp) {
            this.isImage = true;
         } else {
            this.isImage = false;
         }
         this.previewVisible = true;
         this.previewFile = item.UrlDocument;
      }
   }

   /**
    * Reinicia los valores del item e imagen seleccionados para visualizar
    */
   resetValues () {
      this.currentItem = {};
      this.previewFile = '';
   }

   /**
    * Abre una ventana modal para las confirmaciones de peticion
    * @param message - recibe el mensaje que se mostrará en pantalla
    * @param documentType - recibe el tipo de documento que desea editar
    */
   editDocumentModal (message: string, documentType: any): void {
      const modal = this.modalService.create<ModalEditDocumentComponent, any>({
         nzContent: ModalEditDocumentComponent,
         nzCentered: true,
         nzClosable: true,
         // nzData: {
         //    labelReturnButton: 'Entendido',
         //    labelRedirectButton,
         //    labelRedirectButton2
         // },
         nzFooter: null
      });
      const instance = modal.getContentComponent();

      instance.message = message;
      instance.documentType = documentType;

      // Return a result when opened
      modal.afterOpen.subscribe(() => {});
      // Return a result when closed
      modal.afterClose.subscribe((result: any) => {
         if (result) {
         }
      });
   }
}
