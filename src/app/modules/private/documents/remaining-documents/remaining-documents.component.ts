import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { DocumentsCrudService } from '../../../../services/documents/documents-crud.service';
import { DocumentInterface, PercentInterface } from '../../../../models/client.interface';
import { EventManagerService } from '../../../../services/events-manager/event-manager.service';
import { NgZorroModule } from '../../../../ng-zorro.module';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonModule } from '@angular/common';

import { NzUploadFile } from 'ng-zorro-antd/upload';
import { ProviderAssistanceComponent } from '../../../../shared/modals/provider-assistance/provider-assistance.component';

import { FetchBackend } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileValidatorDirective } from 'src/app/directives/file-validator.directive';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { AlertService } from 'src/app/services/alerts/alert.service';

@Component({
   selector: 'app-remaining-documents',
   standalone: true,
   imports: [NgZorroModule, CommonModule, FileValidatorDirective, PipesModule],
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

   @ViewChildren('fileInput') fileInputs!: QueryList<ElementRef<HTMLInputElement>>;

  suraSoftwareTypes: string[] = [
    'Evolve Hc', 'KloudSolutions', 'Medicarte', 'Simedica', 'Sunube',
    'HIMED', 'Netmedik', 'Ekisa', 'Medsys', 'Luku', 'Ipsa', 'Otro'
  ];
  documentIdsWithExpiration: number[] = [
    8, 22, 132, 133, 137, 142
  ];

   constructor(
      private eventManager: EventManagerService,
      private documentService: DocumentsCrudService,
      private notificationService: NzNotificationService,
      public formBuilder: FormBuilder,
      private alertService: AlertService,
   ) { }

   ngOnInit(): void {
     this.getDocumentsToUpload();
   }

  hasExpirationField(idDoc: number | undefined): boolean {
    return idDoc !== undefined && this.documentIdsWithExpiration.includes(idDoc)
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
                  this.hasExpirationField(item.idTypeDocuments)
                    ? [Validators.required]
                    : [],
                ],
                software: [
                  "",
                  item.idTypeDocuments === 138
                    ? [Validators.required]
                    : [],
                ],
                amountPolicy: [
                  "",
                  item.idTypeDocuments === 133
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

  formatterPeso = (value: number | string): string => {
    if (value == null || value === '') return '';
    const number = typeof value === 'string' ? parseInt(value, 10) : Math.floor(value);
    return `$ ${number.toLocaleString('es-CO')}`;
  };
  parserPeso = (value: string): string => {
    if (!value) return '';
    const cleaned = value.replace(/[$\s.]/g, '');
    return cleaned;
  };


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
    * Carga un archivo y lo envia al api de carga de documentos
    * @param file - recibe el archivo para cargar
    * @param item - elemento de la lista para saber cual documento de carga ej (cedula, nit, rethus)
    */
  uploadDocuments(item: any, index: number) {
      const docForm = this.formDocList[index];
      const fileForm = docForm.get("file")?.value;
      const fechaForm = docForm.get("fecha")?.value;
      const softwareForm = docForm.get("software")?.value;
      const amountPolicyForm = docForm.get("amountPolicy")?.value;

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
      if (softwareForm && softwareForm !== '') {
         body.software = softwareForm;
      }
      if (amountPolicyForm) {
         body.amountPolicy = amountPolicyForm;
      }
      fileToUpload.append('datos', JSON.stringify(body));

      this.documentService.uploadDocuments(idProvider, fileToUpload).subscribe({
         next: (res: any) => {
            this.loadingData = false;
            this.createNotificacion('success', 'Carga exitosa', 'El documento se subió de manera satisfactoria');
            this.getDocumentsToUpload();
            // location.reload();
            this.eventManager.getPercentApi.set(this.counterApi + 1);
         },
         error: (err: any) => {
           this.loadingData = false;
           const msg = err.error && err.error.message;
           if (err.status == 400 && msg) {
             this.alertService.error('Oops...', msg);
             return;
           }
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
    if (this.hasExpirationField(item.idTypeDocuments)) {
      const fechaControl = docForm.get("fecha");
      fechaControl?.markAsTouched();
      fechaControl?.updateValueAndValidity();

      if (fechaControl?.invalid) {
          return;
      }
    }
    if (item.idTypeDocuments == 138) {
      const softwareControl = docForm.get("software");
      softwareControl?.markAsTouched();
      softwareControl?.updateValueAndValidity();
      if (softwareControl?.invalid) return;
    }
    if (item.idTypeDocuments == 133) {
      const amountPolicyControl = docForm.get("amountPolicy");
      amountPolicyControl?.markAsTouched();
      amountPolicyControl?.updateValueAndValidity();
      if (amountPolicyControl?.invalid) return;
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
