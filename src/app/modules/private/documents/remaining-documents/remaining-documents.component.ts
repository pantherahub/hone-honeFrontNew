import { Component, OnInit } from '@angular/core';
import { DocumentsCrudService } from '../../../../services/documents/documents-crud.service';
import { DocumentInterface } from '../../../../models/client.interface';
import { EventManagerService } from '../../../../services/events-manager/event-manager.service';
import { NgZorroModule } from '../../../../ng-zorro.module';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable, Observer } from 'rxjs';
import { CommonModule } from '@angular/common';

import { NzUploadFile } from 'ng-zorro-antd/upload';
import { ProviderAssistanceComponent } from '../../../../shared/modals/provider-assistance/provider-assistance.component';

import { FetchBackend } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FileValidatorDirective } from 'src/app/directives/file-validator.directive';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ModalEditDocumentComponent } from '../modal-edit-document/modal-edit-document.component';

@Component({
   selector: 'app-remaining-documents',
   standalone: true,
   imports: [NgZorroModule, CommonModule, FileValidatorDirective],
   templateUrl: './remaining-documents.component.html',
   styleUrl: './remaining-documents.component.scss'
})
export class RemainingDocumentsComponent implements OnInit {
   loading: boolean = false;
   clientSelected: any = this.eventManager.clientSelected();
   counterApi: any = this.eventManager.getPercentApi();
   loadingData: boolean = false;

   documentList: DocumentInterface[] = [];

   formDate!: FormGroup;

   constructor(
      private eventManager: EventManagerService,
      private documentService: DocumentsCrudService,
      private notificationService: NzNotificationService,
      private modalService: NzModalService,
      public formBuilder: FormBuilder,
   ) {
      this.createtiektcForm();
   }

   ngOnInit(): void {
      this.getDocumentsToUpload();
   }

   /**
    * Obtiene el listado de documentos sin cargar
    */
   createtiektcForm() {
      this.formDate = this.formBuilder.group({
         fecha: [""],
      });
   }

   getDocumentsToUpload() {
      this.loadingData = true;
      const { idProvider, idTypeProvider, idClientHoneSolutions } = this.clientSelected;
      this.documentService.getDocumentsToUpload(idProvider, idTypeProvider, idClientHoneSolutions).subscribe({
         next: (res: any) => {
            this.documentList = res;
            this.loadingData = false;
         },
         error: (error: any) => {
            this.loadingData = false;
         },
         complete: () => { }
      });
   }

   private getBase64(img: File, callback: (img: string) => void): void {
      const reader = new FileReader();
      reader.addEventListener('load', () => callback(reader.result!.toString()));
      reader.readAsDataURL(img);
  }

   /**
    * Carga un archivo y lo envia al api de carga de documentos
    * @param event - evento del input que contiene el archivo para cargar
    * @param item - elemento de la lista para saber cual documento de carga ej (cedula, nit, rethus)
    */
  loadFiles(file: any, item: any) {
      if (!file) return;
      this.uploadDocuments(file, item);
  }

  /**
    * Abre una ventana modal para la carga de documentos
    * @param item - recibe el tipo de documento que desea cargar
    */
  uploadDocumentModal(item: any): void {
     const fileToUpload = new FormData();
     const fechaForm = this.formDate.get("fecha")?.value;
    const { idProvider } = this.clientSelected;
    const body: any = {
        posicion: 0,
        documento: item.idTypeDocuments,
        nombredcoumentos: item.NameDocument,
        idUser: idProvider
    };
    if (fechaForm && fechaForm !== 0 && fechaForm !== '') {
      body.fechavencimiento = fechaForm;
   }
    fileToUpload.append('datos', JSON.stringify(body));

    const modal = this.modalService.create<ModalEditDocumentComponent, any>({
       nzContent: ModalEditDocumentComponent,
       nzCentered: true,
       nzClosable: true,
       nzTitle: 'Agregar documento',
       nzFooter: null
    });
    const instance = modal.getContentComponent();

    instance.currentDoc = item;
    instance.documentId = item.idDocumentsProvider;
    instance.documentType = item.idTypeDocuments;
    instance.isNew = true;
    instance.body = body;

    // Return a result when opened
    modal.afterOpen.subscribe(() => {});
    // Return a result when closed
    modal.afterClose.subscribe((result: any) => {
       if (result) {
          if (result.response) {
            this.getDocumentsToUpload();
            // location.reload();
            this.eventManager.getPercentApi.set(this.counterApi + 1);
          }
       }
    });
 }

   /**
    * Carga un archivo y lo envia al api de carga de documentos
    * @param file - recibe el archivo para cargar
    * @param item - elemento de la lista para saber cual documento de carga ej (cedula, nit, rethus)
    */
  uploadDocuments(file: any, item: any) {
      const fechaForm = this.formDate.get("fecha")?.value;

      this.loadingData = true;
      const { idProvider } = this.clientSelected;
      // const today = new Date();
      const today = (fechaForm === 0 || fechaForm === null || fechaForm === undefined || fechaForm === '') ? new Date() : fechaForm;
      const fileToUpload = new FormData();
      fileToUpload.append('archivo', file);
      const body = {
         posicion: 0,
         nombre: file.name,
         documento: item.idTypeDocuments,
         nombredcoumentos: item.NameDocument,
         fechavencimiento: today,
         idUser: idProvider
      };
      fileToUpload.append('datos', JSON.stringify(body));

      this.documentService.uploadDocuments(idProvider, fileToUpload).subscribe({
         next: (res: any) => {
            this.loadingData = false;
            this.createNotificacion('success', 'Carga exitosa', 'El documento se subió de manera satisfactoria');
            this.getDocumentsToUpload();
            // location.reload();
            this.eventManager.getPercentApi.set(this.counterApi + 1);
         },
         error: (error: any) => {
            this.loadingData = false;
            this.createNotificacion('error', 'Error', 'Lo sentimos, hubo un error en el servidor.');
         },
         complete: () => { }
      });
   }

   /**
    * Crea una notificacion de alerta
    * @param type - string recibe el tipo de notificacion (error, success, warning, info)
    * @param title - string recibe el titulo de la notificacion
    * @param message - string recibe el mensaje de la notificacion
    */
   createNotificacion(type: string, title: string, message: string) {
      this.notificationService.create(type, title, message);
   }


   /**
    *
    * @param current Bloquea las fechas antes de la fecha actual, habilita por 30 dias y bloquea fechas posterior
    * @returns
    */
   disableDates = (current: Date): boolean => {
      const today = new Date();
      const maxDate = new Date();
      maxDate.setDate(today.getDate() + 30);
      return current < today || current > maxDate;
   };


}
