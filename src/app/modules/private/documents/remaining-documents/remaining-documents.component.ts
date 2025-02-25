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
              this.formBuilder.group({
                file: [null, Validators.required],
                fecha: [
                  "",
                  item.idTypeDocuments === 8 ||
                  item.idTypeDocuments === 22 ||
                  item.idTypeDocuments === 113 ||
                  item.idTypeDocuments === 108
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
  loadFiles(file: any, item: any, index: number, autoUpload: boolean = false) {
      if (!file) return;
      this.formDocList[index].patchValue({
        file: file
      });
      if (autoUpload) {
        this.uploadDocuments(item, index);
      }
    }

   /**
    * Carga un archivo y lo envia al api de carga de documentos
    * @param file - recibe el archivo para cargar
    * @param item - elemento de la lista para saber cual documento de carga ej (cedula, nit, rethus)
    */
  uploadDocuments(item: any, index: number) {
      const docForm = this.formDocList[index];
      const fileForm = docForm.get("file")?.value;
      const fechaForm = docForm.get("fecha")?.value;

      this.loadingData = true;
      const { idProvider } = this.clientSelected;
      const fileToUpload = new FormData();
      fileToUpload.append('archivo', fileForm);
      const body: any = {
         posicion: 0,
         nombre: fileForm.name,
         documento: item.idTypeDocuments,
         nombredcoumentos: item.NameDocument,
         idUser: idProvider
      };
      if (fechaForm && fechaForm !== 0 && fechaForm !== '') {
         body.fechavencimiento = fechaForm;
      }
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

  submitForm(index: number, item: DocumentInterface) {
    const docForm = this.formDocList[index];
    const file = docForm.get("file")?.value;
    if (!file) {
        this.createNotificacion("error", "Error", "Debe seleccionar un documento.");
        return;
    }
    if (item.idTypeDocuments == 8 || item.idTypeDocuments == 22 || item.idTypeDocuments == 113 || item.idTypeDocuments == 108) {
      const fechaControl = docForm.get("fecha");
      fechaControl?.markAsTouched();
      fechaControl?.updateValueAndValidity();

      if (fechaControl?.invalid) {
          return;
      }
  }
    this.uploadDocuments(item, index);
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

}
