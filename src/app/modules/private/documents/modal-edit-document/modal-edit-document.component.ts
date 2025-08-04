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
import { AlertService } from 'src/app/services/alerts/alert.service';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';
import { formatListWithY } from 'src/app/utils/string-utils';

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
  @Input() idDocumentType?: any;
  @Input() isNew: boolean = false;
  @Input() bodyData?: any = null;

  clientSelected: any = this.eventManager.clientSelected();

  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);

  suraSoftwareTypes: string[] = [
    'Evolve Hc', 'KloudSolutions', 'Medicarte', 'Simedica', 'Sunube',
    'HIMED', 'Netmedik', 'Ekisa', 'Medsys', 'Luku', 'Ipsa', 'Otro'
  ];
  suraArlEntities: string[] = [
    'ARL COLSANITAS', 'ALFATEP', 'ARL SURA', 'ARP AURORA', 'ARP BOLIVAR',
    'ARP COLMENA', 'ARP COLPATRIA', 'LA EQUIDAD SEGUROS DE VIDA S.A',
    'LIBERTY SEGUROS DE VIDA S.A', 'MAPFRE', 'POSITIVA ARP', 'AXA ARL', 'OTRAS',
  ];
  riskClassifierOptions = ['1', '2', '3', '4', '5'];

  readonly SMLV: number = 1423500;
  readonly typePolicyProviderConfig: { [key: string]: number } = {
    'Psicólogo': 200,
    'Nutricionista': 200,
    'Terapeuta': 200,
    'Fonoaudiólogo': 200,
    'Profesional médico': 420,
    'IPS': 420,
  };
  hasShownAmountMessage: boolean = false;

  expeditionDateRestrictions: { [key: number]: 'lastMonth' | 'currentYear' | 'last3Years' | 'last2Months' } = {
    108: 'lastMonth',
    113: 'lastMonth',
    139: 'last2Months',
    140: 'last2Months',
    4: 'currentYear',
    110: 'currentYear',
    111: 'currentYear',
    134: 'currentYear',
    135: 'currentYear',
    137: 'last3Years',
  };

   constructor (
      private formBuilder: FormBuilder,
      private notificationService: NzNotificationService,
      private documentService: DocumentsCrudService,
      private eventManager: EventManagerService,
      private alertService: AlertService,
      private formUtils: FormUtilsService,
   ) { }

  ngAfterContentChecked (): void {}

  ngOnInit(): void {
    this.createForm();
  }

  destroyModal (response: boolean = false): void {
    this.#modal.destroy({ response });
  }

  /**
  * Crea e Inicializa el formulario
  */
  createForm() {
    this.documentForm = this.formBuilder.nonNullable.group({
      software: [ '', [Validators.required] ],
      dateExpedition: [ '', [Validators.required] ],
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
      resolutionOfThePension: ['', [Validators.required]],
      amountPolicy: ['', [Validators.required]],
      idDocumentType: [ '', [Validators.required] ],
    });

    // Clear validations of fields that do not apply
    Object.keys(this.documentForm.controls).forEach(controlName => {
      if (!this.isFieldRequiredForDocumentType(controlName)) {
        this.documentForm.controls[controlName].clearValidators();
      }
    });
    // Update validity statuses
    this.documentForm.updateValueAndValidity();

    if (this.currentDoc) this.patchForm();
  }

  /**
  * Checks if the field is required for the document type
  */
  isFieldRequiredForDocumentType(controlName: string): boolean {
    const documentValidationMap: any = {
      'software': [138],
      'dateExpedition': [
        4, 113, 12, 110, 111, 108, 137,
        130, 131, 132, 133, 134, 135, 136, 138, 139, 140, 141, 142
      ],
      'dateDiligence': [1, 35],
      'dateFirm': [2, 19],
      'dateVaccination': [6, 32],
      'dueDate': [
        8, 22, 37, 21, 133, 137,
        132, 139, 140, 142
      ],
      'legalRepresentative': [113],
      'NameAlternate': [113],
      'documentDeliveryDate': [10, 11],
      'dateOfBirth': [12, 130],
      'consultationDate': [16],
      'endorsedSpecialtyDate': [16],
      'validityStartDate': [20],
      'dateofRealization': [36, 24, 23],
      'receptionDate': [25, 29],
      'lastDosimetryDate': [0],
      'epsName': [13, 14, 135],
      'riskClassifier': [13, 135],
      'resolutionOfThePension': [15],
      'amountPolicy': [133],
    };
    return documentValidationMap[controlName]?.includes(this.idDocumentType);
  }

  sanitizeWithOptions(value: any, validValues: any[]): any | null {
    return validValues.includes(value) ? value : null;
  }

   /**
    * Valida el tipo de documento que se va a editar
    */
   validateDocumentType() { }

   getExpeditionTooltipContent(): string {
      const restriction = this.expeditionDateRestrictions[this.idDocumentType];
      switch (restriction) {
        case 'lastMonth':
          return 'Debe ser no mayor a un mes.';
        case 'currentYear':
          return 'Debe ser del año inmediatamente presente.';
        case 'last3Years':
          return 'Debe ser no mayor a tres años.';
        case 'last2Months':
          return 'Debe ser no mayor a dos meses.';
        default:
          return '';
      }
    }

  /**
   *
   * @param current Bloquea las fechas antes de la fecha actual, habilita por un año y bloquea fechas posterior (para fecha de expedición)
   * @returns
   */
  disableExpeditionDates = (current: Date): boolean => {
    current.setHours(0, 0, 0, 0);
    const restriction = this.expeditionDateRestrictions[this.idDocumentType];
    if (!restriction) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (restriction) {
      case 'lastMonth':
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        return current < lastMonth || current > today;

      case 'last2Months':
        const twoMonthsAgo = new Date(today);
        twoMonthsAgo.setMonth(today.getMonth() - 2);
        return current < twoMonthsAgo || current > today;

      case 'currentYear':
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        return current < startOfYear || current > today;

      case 'last3Years':
        const threeYearsAgo = new Date(today);
        threeYearsAgo.setFullYear(today.getFullYear() - 3);
        return current < threeYearsAgo || current > today;

      default:
        return false;
    }
  };

  onAmountPolicyChange(): void {
    const control = this.documentForm.get('amountPolicy');
    let value = control?.value;
    const formatted = this.formUtils.formatCurrency(value);
    control?.setValue(formatted, { emitEvent: false });
  }

  amountPolicyInfoAlert(onFocus: boolean = false): void {
    if (onFocus && this.hasShownAmountMessage) return;
    this.hasShownAmountMessage = true;

    // Group by SMLVs num min
    const groups: { [smlvNum: number]: string[] } = {};
    for (let type in this.typePolicyProviderConfig) {
      let smlvNum = this.typePolicyProviderConfig[type];
      if (!groups[smlvNum]) groups[smlvNum] = [];
      groups[smlvNum].push(type);
    }

    // Generate dinamic message
    let html = '';
    for (let smlvNum in groups) {
      let provTypes = groups[smlvNum];
      let value = this.SMLV * parseInt(smlvNum);
      html += `
        <p>
          Para <strong>${formatListWithY(provTypes)}</strong>, el valor mínimo requerido de la póliza es equivalente a
          <strong>${smlvNum} SMLV</strong>
          (<strong>${smlvNum} x $${this.SMLV.toLocaleString('es-CO')} = $${value.toLocaleString('es-CO')}</strong>)
        </p>
      `;
    }
    html += `<p class="mt-3">Por favor verifica este monto.</p>`;

    const modalRef = this.alertService.info(
      'Información sobre valores de póliza',
      html,
      {
        nzOkText: 'Entendido',
        nzClosable: false,
        nzWidth: 600,
        nzContent: html,
        nzOnOk: () => {
          this.policyCloseAlert(modalRef);
          return false; // Avoid close modal
        }
      }
    );
  }

  policyCloseAlert(firstModalRef: NzModalRef) {
    this.alertService.confirm(
      'IMPORTANTE',
      'Debe leer la información anterior sobre los valores de la póliza para evitar devoluciones y retrasos en la gestión documental.',
      {
        nzClosable: false,
        nzWidth: 500,
        nzCancelText: 'Volver a revisar',
        nzOkText: 'Ya leí la información anterior',
        nzOkDanger: true,
        nzOnOk: () => {
          firstModalRef.destroy();
        },
      }
    );
  }

  patchForm() {
    const item = this.currentDoc;

    let riskClassifier = item.riskClassifier;
    if (!this.riskClassifierOptions.includes(riskClassifier)) {
      riskClassifier = null;
    }

    const amountPolicy = this.formUtils.formatCurrency(item.amountPolicy);

    this.documentForm.patchValue({
      software: this.sanitizeWithOptions(item.software, this.suraSoftwareTypes),
      consultationDate: this.convertDate(item.consultationDate),
      dateDiligence: this.convertDate(item.dateDiligence),
      dateFirm: this.convertDate(item.dateFirm),
      dateOfBirth: this.convertDate(item.dateOfBirth),
      dateofRealization: this.convertDate(item.dateofRealization),
      dateVaccination: this.convertDate(item.dateVaccination),
      documentDeliveryDate: this.convertDate(item.documentDeliveryDate),
      dueDate: this.convertDate(item.dueDate),
      endorsedSpecialtyDate: this.convertDate(item.endorsedSpecialtyDate),
      epsName: this.sanitizeWithOptions(item.epsName, this.suraArlEntities),
      dateExpedition: this.convertDate(item.dateExpedition),
      lastDosimetryDate: this.convertDate(item.lastDosimetryDate),
      legalRepresentative: item.legalRepresentative,
      NameAlternate: item.NameAlternate,
      receptionDate: this.convertDate(item.receptionDate),
      resolutionOfThePension: item.resolutionOfThePension,
      riskClassifier: this.sanitizeWithOptions(item.riskClassifier, this.riskClassifierOptions),
      validityStartDate: this.convertDate(item.validityStartDate),
      amountPolicy: amountPolicy,
      idDocumentType: item.idDocumentType,
    });
  }

  /**
  * Carga un archivo y lo envia al api de carga de documentos
  * @param event - evento del input que contiene el archivo para cargar
  * @param item - elemento de la lista para saber cual documento de carga ej (cedula, nit, rethus)
  */
  loadFile (file: any) {
    if (file) this.loadedFile = file;
  }

createFormData(): FormData {
  const dataToUpload = new FormData();
  const unifiedData: any = {};

  // Add body data
  if (this.isNew && this.bodyData) {
    Object.assign(unifiedData, this.bodyData);
  }

  if (this.loadedFile) {
    unifiedData['nameDocument'] = this.loadedFile.name;
  }

  const idProvider = this.clientSelected.idProvider;
  unifiedData['idUser'] = idProvider;

  // Add form data
  const docForm = { ...this.documentForm.value };
  for (const [key, value] of Object.entries(docForm)) {
    if (value && value instanceof Date) {
      unifiedData[key] = value.toString().split('T')[0];
    } else if (value != null && value.toString().trim() != '') {
      let appendValue: any = value;
      if (key === 'amountPolicy') {
        appendValue = this.formUtils.sanitizeToNumeric(value.toString(), true);
      }
      unifiedData[key] = appendValue;
    } else {
      // unifiedData[key] = '';
    }
  }

  // If not new, add all data directly into the FormData
  if (!this.isNew) {
    for (const [key, value] of Object.entries(unifiedData)) {
      dataToUpload.append(key, String(value));
    }
  } else {
    // If new, add the data as a single JSON
    dataToUpload.append('datos', JSON.stringify(unifiedData));
  }

  // Add the separate file (binary only)
  if (this.loadedFile) {
    dataToUpload.append('archivo', this.loadedFile);
  }

  return dataToUpload;
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
    } else if (this.isNew && !this.loadedFile) {
      this.createNotificacion("warning", "Aviso", "Debe seleccionar un documento.");
      return;
    }
    this.loader = true;

    const fileToUpload = this.createFormData();

    if (this.isNew) {
      this.saveDocument(fileToUpload);
      return;
    }

    this.documentService.updateDocuments(this.currentDoc.idDocumentsProvider, fileToUpload).subscribe({
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

  saveDocument(fileToUpload: FormData) {
    const { idProvider } = this.clientSelected;
    this.documentService.uploadDocuments(idProvider, fileToUpload).subscribe({
      next: (res: any) => {
        this.loader = false;
        this.createNotificacion('success', 'Carga exitosa', 'El documento se subió de manera satisfactoria');
        this.destroyModal(true);
      },
      error: (error: any) => {
        this.loader = false;
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
