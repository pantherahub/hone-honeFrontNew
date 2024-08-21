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
import { NzModalService } from 'ng-zorro-antd/modal';
import { FetchBackend } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
   selector: 'app-remaining-documents',
   standalone: true,
   imports: [NgZorroModule, CommonModule],
   templateUrl: './remaining-documents.component.html',
   styleUrl: './remaining-documents.component.scss'
})
export class RemainingDocumentsComponent implements OnInit {
   loading: boolean = false;
   clientSelected: any = this.eventManager.clientSelected();
   counterApi: any = this.eventManager.getPercentApi();
   loadingData: boolean = false;

   documentList: DocumentInterface[] = [];
   // documentList: any[] = [];
   form!: FormGroup;
   constructor(
      private eventManager: EventManagerService,
      private documentService: DocumentsCrudService,
      private notificationService: NzNotificationService,
      private modalService: NzModalService,
      public fb: FormBuilder,
   ) {
      this.createtiektcForm();
   }
   idDocumentsByModal: any = 0;


   ngOnInit(): void {
      this.getDocumentsToUpload();
   }

   /**
    * Obtiene el listado de documentos sin cargar
    */
   createtiektcForm() {
      this.form = this.fb.group({
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
   loadFiles(event: any, item: any) {
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
   uploadDocuments(file: any, item: any) {
      const fechaForm = this.form.get("fecha")?.value;
      
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
            location.reload();
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
   * Abre una ventana modal para actualizar el nombre del representante legal, 
   * donde se puede abrir mediante funcion del mismo modal de contacts-provider
   * y tambien se abre por defecto o automaticamente cuando elija allianz
   */
   openModalProviderAssistance() {
      const modal = this.modalService.create<ProviderAssistanceComponent, any>({
         nzContent: ProviderAssistanceComponent,
         nzCentered: true,
         nzClosable: true, //en false para ocultar la X del modal y que no pueda cerrarlo
         // nzFooter: null
         nzMaskClosable: false, // Para evitar que se cierre al hacer clic fuera del modal
         nzOnOk: () => console.log('OK'),
         nzOnCancel: () => console.log('Cancelar') // Maneja el evento de cancelación
      });
      const instance = modal.getContentComponent();

      // instance.message = message;

      // Return a result when opened
      modal.afterOpen.subscribe(() => { });
      // Return a result when closed
      modal.afterClose.subscribe((result: any) => {
         if (result) {
         }
      });
   }
}
