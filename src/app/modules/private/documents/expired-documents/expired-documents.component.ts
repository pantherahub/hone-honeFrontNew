import { Component, OnInit } from '@angular/core';
import { EventManagerService } from '../../../../services/events-manager/event-manager.service';
import { DocumentsCrudService } from '../../../../services/documents/documents-crud.service';
import { DocumentInterface } from '../../../../models/client.interface';
import { CommonModule } from '@angular/common';
import { NgZorroModule } from '../../../../ng-zorro.module';
import { PipesModule } from '../../../../pipes/pipes.module';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
   selector: 'app-expired-documents',
   standalone: true,
   imports: [ CommonModule, NgZorroModule, PipesModule, PdfViewerModule ],
   templateUrl: './expired-documents.component.html',
   styleUrl: './expired-documents.component.scss'
})
export class ExpiredDocumentsComponent implements OnInit {
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
      this.getExpiredDocuments();
   }

   /**
    * Obtiene el listado de documentos cargados
    */
   getExpiredDocuments () {
      this.loadingData = true;
      const { idProvider, idTypeProvider, idClientHoneSolutions } = this.clientSelected;
      this.documentService.getExpiredDocuments(idProvider, idTypeProvider, idClientHoneSolutions).subscribe({
         next: (res: any) => {
            console.log('getExpiredDocuments: ', res);
            this.loadingData = false;
            if (res) {
               this.documentList = res;
            } else {
               this.documentList = [];
            }
         },
         error: (error: any) => {
            this.loadingData = false;
            this.documentList = [];
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
            this.getExpiredDocuments();
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
                  this.getExpiredDocuments();
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
      this.currentItem = {};
      this.previewFile = '';
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
}
