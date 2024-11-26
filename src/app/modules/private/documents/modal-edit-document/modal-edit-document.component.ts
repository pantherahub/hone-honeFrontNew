import { Component, inject, AfterContentChecked, Input, OnInit } from '@angular/core';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NgZorroModule } from '../../../../ng-zorro.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DocumentsCrudService } from '../../../../services/documents/documents-crud.service';
import { EventManagerService } from '../../../../services/events-manager/event-manager.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FileValidatorDirective } from 'src/app/directives/file-validator.directive';
import { DatePickerInputComponent } from 'src/app/shared/forms/date-picker-input/date-picker-input.component';

@Component({
   selector: 'app-modal-edit-document',
   standalone: true,
   imports: [ NgZorroModule, CommonModule, FileValidatorDirective, DatePickerInputComponent ],
   templateUrl: './modal-edit-document.component.html',
   styleUrl: './modal-edit-document.component.scss'
})
export class ModalEditDocumentComponent implements AfterContentChecked, OnInit {
   loader: boolean = false;
   documentForm!: FormGroup;

   loadedFile: any;

   @Input() currentDoc?: any;
   @Input() documentId?: any;
   @Input() documentType?: any;

   clientSelected: any = this.eventManager.clientSelected();

   readonly #modal = inject(NzModalRef);
   readonly nzModalData: any = inject(NZ_MODAL_DATA);

   constructor (
      private formBuilder: FormBuilder,
      private notificationService: NzNotificationService,
      private documentService: DocumentsCrudService,
      private eventManager: EventManagerService
   ) {
      // this.createForm();
   }

   ngAfterContentChecked (): void {}

   ngOnInit(): void {
      this.createForm();
      this.validateDocumentType();
      // this.patchForm();
   }

   destroyModal (response: boolean = false): void {
      this.#modal.destroy({ response });
   }

   /**
    * Crea e Inicializa el formulario
    */
   createForm() {
      this.documentForm = this.formBuilder.nonNullable.group({
         nombredocumento: [ '' ],
         fechadedocumento: [ '', [Validators.required] ],
         dateDiligence: [ '', [Validators.required] ],
         dateFirm: [ '', [Validators.required] ],
         dateVaccination: [ '', [Validators.required] ],
         dueDate: [ '', [Validators.required] ],
         legalRepresentative: [ '', [Validators.required] ],
         NameAlternate: [ '', [Validators.required] ],
         documentDeliveryDate: [ '', [Validators.required] ],
         dateOfBirth: [ '', [Validators.required] ],
         consultationDate: [ '', [Validators.required] ],
         endorsedSpecialtyDate: [ '', [Validators.required] ],
         validityStartDate: [ '', [Validators.required] ],
         dateofRealization: [ '', [Validators.required] ],
         receptionDate: [ '', [Validators.required] ],
         lastDosimetryDate: [ '', [Validators.required] ],
         epsName: [ '', [Validators.required] ],
         riskClassifier: [ '', [Validators.required] ],
         resolutionOfThePension: [ '', [Validators.required] ]
      });

      // Clear validations of fields that do not apply
      Object.keys(this.documentForm.controls).forEach(controlName => {
         if (!this.isFieldRequiredForDocumentType(controlName)) {
            this.documentForm.controls[controlName].clearValidators();
         }
      });
      // Update validity statuses
      this.documentForm.updateValueAndValidity();

      this.patchForm();
   }

   /**
    * Checks if the field is required for the document type
    */
   isFieldRequiredForDocumentType(controlName: string): boolean {
      const documentValidationMap: any = {
         'fechadedocumento': [4, 12, 110, 111, 77, 108],
         'dateDiligence': [1, 35],
         'dateFirm': [2, 19],
         'dateVaccination': [6, 32],
         'dueDate': [8, 22, 37, 21],
         'legalRepresentative': [7],
         'NameAlternate': [7],
         'documentDeliveryDate': [10, 11],
         'dateOfBirth': [12],
         'consultationDate': [16],
         'endorsedSpecialtyDate': [16],
         'validityStartDate': [20],
         'dateofRealization': [36, 24, 23],
         'receptionDate': [25, 29],
         'lastDosimetryDate': [0],
         'epsName': [13, 14],
         'riskClassifier': [13],
         'resolutionOfThePension': [15]
      };
      return documentValidationMap[controlName]?.includes(this.documentType);
   }

   patchForm () {
      const item = this.currentDoc;

      this.documentForm.patchValue({
         consultationDate: this.convertDate(item.consultationDate),
         dateDiligence: this.convertDate(item.dateDiligence),
         dateFirm: this.convertDate(item.dateFirm),
         dateOfBirth: this.convertDate(item.dateOfBirth),
         dateofRealization: this.convertDate(item.dateofRealization),
         dateVaccination: this.convertDate(item.dateVaccination),
         documentDeliveryDate: this.convertDate(item.documentDeliveryDate),
         dueDate: this.convertDate(item.dueDate),
         endorsedSpecialtyDate: this.convertDate(item.endorsedSpecialtyDate),
         epsName: item.epsName,
         fechadedocumento: this.convertDate(item.fechadedocumento),
         lastDosimetryDate: this.convertDate(item.lastDosimetryDate),
         legalRepresentative: item.legalRepresentative,
         NameAlternate: item.NameAlternate,
         nombredocumento: item.nombredocumento,
         receptionDate: this.convertDate(item.receptionDate),
         resolutionOfThePension: item.resolutionOfThePension,
         riskClassifier: item.riskClassifier,
         validityStartDate: this.convertDate(item.validityStartDate)
      });
   }

   /**
    * Valida el tipo de documento que se va a editar
    */
   validateDocumentType() { }

    /**
     *
     * @param current Bloquea las fechas antes de la fecha actual, habilita por un año y bloquea fechas posterior (para fecha de expedición)
     * @returns
     */
    disableDates = (current: Date): boolean => {
      const withRestriction = [4, 77, 108, 110, 111];
      if (!withRestriction.includes(this.documentType)) {
        return false;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const maxDate = new Date();
      maxDate.setHours(0, 0, 0, 0);
      // One year from today
      maxDate.setFullYear(today.getFullYear() + 1);
      return current < today || current > maxDate;
    };

   /**
    * Carga un archivo y lo envia al api de carga de documentos
    * @param event - evento del input que contiene el archivo para cargar
    * @param item - elemento de la lista para saber cual documento de carga ej (cedula, nit, rethus)
    */
   loadFile (file: any) {
      if (file) this.loadedFile = file;
   }

   /**
    * Envia peticion al servicio de login para obtener el token de acceso
    */
   submitRequest() {
      if (this.documentForm.invalid) {
         Object.values(this.documentForm.controls).forEach(control => {
            if (control.invalid) {
               control.markAsDirty();
               control.updateValueAndValidity({ onlySelf: true });
            }
         });
         return;
      }
      this.loader = true;

      const fileToUpload = new FormData();
      if (this.loadedFile) {
         fileToUpload.append('archivo', this.loadedFile);
      }
      const { idProvider } = this.clientSelected;
      fileToUpload.append('idUser', idProvider);

      const docForm: Object = { ...this.documentForm.value };

    for (const [key, value] of Object.entries(docForm)) {
         if (value && value instanceof Date) {
            fileToUpload.append(key, value.toString().split('T')[0]);
         } else if (value != null && value.toString().trim() != '') {
            fileToUpload.append(key, value);
         } else {
            fileToUpload.append(key, '');
         }
      }

      this.documentService.updateDocuments(this.documentId, fileToUpload).subscribe({
         next: (res: any) => {
            this.loader = false;
            this.createNotificacion('success', 'Documento actualizado', 'El documento se actualizó correctamente.');
            this.destroyModal(true);
         },
         error: (error: any) => {
            this.createNotificacion('error', 'Error', 'Lo sentimos, hubo un error en el servidor.');
            this.loader = false;
         },
         complete: () => {}
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

   convertDate (date: any) {
      if (date) {
         if (date.length > 10) {
            const dateFormatted = date.split('T')[0];
            return dateFormatted;
         }
         const d = new Date(date);
         const today = `${d.getFullYear()}-${`0${d.getMonth() + 1}`.slice(-2)}-${`0${d.getDate()}`.slice(-2)}`;
         return today;
      } else {
         return '';
      }
   }
}
