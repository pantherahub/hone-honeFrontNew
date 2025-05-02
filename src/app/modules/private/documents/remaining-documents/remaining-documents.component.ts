import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
   formDocList: FormGroup[] = [];

   formDate!: FormGroup;

   @ViewChildren('fileInput') fileInputs!: QueryList<ElementRef<HTMLInputElement>>;

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
            this.formDocList = res.map((item: DocumentInterface) =>
              // Input tipo fecha normal para Habilitación (REPS)	y Poliza de Responsabilidad civil
              this.formBuilder.group({
                file: [null, Validators.required],
                fecha: [
                  "",
                  item.idTypeDocuments === 8 ||
                  item.idTypeDocuments === 22
                    ? [Validators.required]
                    : [],
                ],
              })
            );
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

   triggerFileInput(index: number): void {
      const fileInput = this.fileInputs.toArray()[index].nativeElement;
      if (fileInput) {
        fileInput.click();
      }
    }


   /**
    * Carga un archivo y lo envia al api de carga de documentos
    * @param event - evento del input que contiene el archivo para cargar
    * @param item - elemento de la lista para saber cual documento de carga ej (cedula, nit, rethus)
    */
  loadFiles(file: any, item: any, index: number) {
      if (!file) return;
      this.formDocList[index].patchValue({
        file: file
      });
  }

  /**
    * Abre una ventana modal para la carga de documentos
    * @param item - recibe el tipo de documento que desea cargar
    */
  uploadDocumentModal(item: any): void {
    const fileToUpload = new FormData();
    const body: any = {
        idDocumentType: item.idTypeDocuments,
      //   nameRepresentative: item.NameDocument,
    };
    fileToUpload.append('datos', JSON.stringify(body));

    const modal = this.modalService.create<ModalEditDocumentComponent, any>({
       nzContent: ModalEditDocumentComponent,
       nzCentered: true,
       nzClosable: true,
       nzTitle: 'Agregar documento',
       nzFooter: null
    });
    const instance = modal.getContentComponent();

    instance.idDocumentType = item.idTypeDocuments;
    instance.isNew = true;
    instance.bodyData = body;

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
    * @param current Bloquea las fechas antes de la fecha actual
    * @returns
    */
  disableDates = (current: Date): boolean => {
    const today = new Date();
    return current < today;
  };

}
