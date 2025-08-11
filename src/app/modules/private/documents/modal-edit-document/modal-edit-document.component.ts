import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NgZorroModule } from '../../../../ng-zorro.module';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { DocumentsCrudService } from '../../../../services/documents/documents-crud.service';
import { EventManagerService } from '../../../../services/events-manager/event-manager.service';
import { FileValidatorDirective } from 'src/app/directives/file-validator.directive';
import { DatePickerInputComponent } from 'src/app/shared/components/date-picker-input/date-picker-input.component';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';
import { formatListWithY, pluralize } from 'src/app/utils/string-utils';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { TextInputComponent } from 'src/app/shared/components/text-input/text-input.component';
import { InputErrorComponent } from 'src/app/shared/components/input-error/input-error.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { SelectComponent } from 'src/app/shared/components/select/select.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { AlertService } from 'src/app/services/alert/alert.service';


@Component({
  selector: 'app-modal-edit-document',
  standalone: true,
  imports: [
    NgZorroModule,
    CommonModule,
    PipesModule,
    FileValidatorDirective,
    DatePickerInputComponent,
    TextInputComponent,
    InputErrorComponent,
    ButtonComponent,
    SelectComponent
  ],
  templateUrl: './modal-edit-document.component.html',
  styleUrl: './modal-edit-document.component.scss'
})
export class ModalEditDocumentComponent implements OnInit {
  loader: boolean = false;
  documentForm!: FormGroup;

  loadedFile: any;

  @Input() currentDoc?: any;
  @Input() isNew: boolean = false;

  clientSelected: any = this.eventManager.clientSelected();

  customMessagesExpeditionMap = {
    dateExpeditionInvalid: (error: any) => error
  };

  suraSoftwareTypes: string[] = [
    'Evolve Hc',
    'KloudSolutions',
    'Medicarte',
    'Simedica',
    'Sunube',
    'HIMED',
    'Netmedik',
    'Ekisa',
    'Medsys',
    'Luku',
    'Ipsa',
    'Otro'
  ];
  suraArlEntities: string[] = [
    'ARL COLSANITAS',
    'ALFATEP',
    'ARL SURA',
    'ARP AURORA',
    'ARP BOLIVAR',
    'ARP COLMENA',
    'ARP COLPATRIA',
    'LA EQUIDAD SEGUROS DE VIDA S.A',
    'LIBERTY SEGUROS DE VIDA S.A',
    'MAPFRE',
    'POSITIVA ARP',
    'AXA ARL',
    'OTRAS'
  ];
  riskClassifierOptions = ['1', '2', '3', '4', '5'];

  readonly SMLV: number = 1423500;
  readonly typePolicyProviderConfig: { [key: string]: number } = {
    Psicólogo: 200,
    Nutricionista: 200,
    Terapeuta: 200,
    Fonoaudiólogo: 200,
    'Profesional médico': 420,
    IPS: 420
  };
  hasShownAmountMessage: boolean = false;

  @ViewChild('dateInput', { static: true }) dateInputRef!: ElementRef;

  constructor(
    private modalRef: ModalComponent,
    private formBuilder: FormBuilder,
    private documentService: DocumentsCrudService,
    private eventManager: EventManagerService,
    private alertService: AlertService,
    private formUtils: FormUtilsService
  ) {}

  ngOnInit(): void {
    // console.log('currentDoc', this.currentDoc);
    this.createForm();
  }

  closeModal(response: boolean = false): void {
    this.modalRef.close({ response });
  }

  createForm() {
    this.documentForm = this.formBuilder.nonNullable.group({
      software: ['', [Validators.required]],
      dateExpedition: ['', [
        Validators.required,
        this.dateExpeditionValidator.bind(this)
      ]],
      dateDiligence: ['', [Validators.required]],
      dateSignature: ['', [Validators.required]],
      dateVaccination: ['', [Validators.required]],
      expirationDate: ['', [Validators.required]],
      legalRepresentative: ['', [Validators.required]],
      NameAlternate: ['', [Validators.required]],
      documentDeliveryDate: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      consultationDate: ['', [Validators.required]],
      endorsedSpecialtyDate: ['', [Validators.required]],
      validityStartDate: ['', [Validators.required]],
      dateofRealization: ['', [Validators.required]],
      receptionDate: ['', [Validators.required]],
      lastDosimetryDate: ['', [Validators.required]],
      epsName: ['', [Validators.required]],
      riskClassifier: ['', [Validators.required]],
      resolutionOfThePension: ['', [Validators.required]],
      amountPolicy: ['', [Validators.required]],
      idDocumentType: [this.currentDoc?.idDocumentType || '', [Validators.required]]
    });

    // Clear validations of fields that do not apply
    Object.keys(this.documentForm.controls).forEach(controlName => {
      if (!this.isFieldRequiredForDocumentType(controlName)) {
        this.documentForm.controls[controlName].clearValidators();
      }
    });
    // Update validity statuses
    this.documentForm.updateValueAndValidity();

    if (this.currentDoc && !this.isNew) this.patchForm();
  }

  /**
   * Checks if the field is required for the document type
   */
  isFieldRequiredForDocumentType(controlName: string): boolean {
    if (!this.currentDoc.showInProviderSystem) return false;
    const documentValidationMap: any = {
      software: this.currentDoc.withSoftwareMedicalRecord,
      dateExpedition: this.currentDoc.withExpedition,
      dateDiligence: this.currentDoc.withDateDiligence,
      dateSignature: this.currentDoc.withDateSignature,
      dateVaccination: this.currentDoc.withDateVaccination,
      expirationDate: this.currentDoc.withExpiration,
      legalRepresentative: this.currentDoc.withLegalRepresentative,
      NameAlternate: this.currentDoc.withLegalRepresentative,
      documentDeliveryDate: this.currentDoc.withDeliveryDate,
      dateOfBirth: this.currentDoc.withDateOfBirth,
      consultationDate: this.currentDoc.withConsultationDate,
      endorsedSpecialtyDate: this.currentDoc.withEndorsedSpecialtyDate,
      validityStartDate: this.currentDoc.withValidityStartDate,
      dateofRealization: this.currentDoc.withDateofRealization,
      receptionDate: this.currentDoc.withReceptionDate,
      epsName: this.currentDoc.withEpsName,
      riskClassifier: this.currentDoc.withRiskClassifier,
      resolutionOfThePension: this.currentDoc.withResolutionOfThePension,
      amountPolicy: this.currentDoc.withAmountPolicy
    };
    return documentValidationMap[controlName];
  }

  sanitizeWithOptions(value: any, validValues: any[]): any | null {
    return validValues.includes(value) ? value : null;
  }

  getExpeditionTooltipContent(): string {
    const typeDoc = this.currentDoc;

    if (typeDoc.currentYear) {
      return 'Debe ser del año inmediatamente presente.';
    }
    if (typeDoc.lastMonth !== null) {
      return `Debe ser no mayor a ${pluralize('un mes', `${typeDoc.lastMonth} meses`, typeDoc.lastMonth)}.`;
    }
    if (typeDoc.lastYear !== null) {
      return `Debe ser no mayor a ${pluralize('un año', `${typeDoc.lastYear} años`, typeDoc.lastYear)}.`;
    }
    return '';
  }

  dateExpeditionValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const selectedDate = new Date(control.value + 'T00:00:00');
    const today = new Date();
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();

    const typeDoc = this.currentDoc;

    if (typeDoc.currentYear) {
      if (selectedDate.getFullYear() !== currentYear || selectedDate > today) {
        return { dateExpeditionInvalid: 'Debe ser del año inmediatamente presente.' };
      }
    } else if (typeDoc.lastMonth !== null) {
      const maxMonthAgo = new Date(today);
      maxMonthAgo.setMonth(today.getMonth() - typeDoc.lastMonth);
      if (selectedDate < maxMonthAgo || selectedDate > today) {
        return {
          dateExpeditionInvalid: `Debe ser no mayor a ${pluralize(
            'un mes', `${typeDoc.lastMonth} meses`,
            typeDoc.lastMonth
          )}.`
        };

      }
    } else if (typeDoc.lastYear !== null) {
      const maxYearsAgo = new Date(today);
      maxYearsAgo.setFullYear(currentYear - typeDoc.lastYear);
      if (selectedDate < maxYearsAgo || selectedDate > today) {
        return {
          dateExpeditionInvalid: `Debe ser no mayor a ${pluralize(
            'un año', `${typeDoc.lastYear} años`,
            typeDoc.lastYear
          )}.`
        };
      }
    }

    return null;
  }

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
          Para <strong>${formatListWithY(
            provTypes
          )}</strong>, el valor mínimo requerido de la póliza es equivalente a
          <strong>${smlvNum} SMLV</strong>
          (<strong>${smlvNum} x $${this.SMLV.toLocaleString(
        'es-CO'
      )} = $${value.toLocaleString('es-CO')}</strong>)
        </p>
      `;
    }
    html += `<p class="mt-3">Por favor verifica este monto.</p>`;

    this.alertService
      .showAlert({
        title: 'Información sobre valores de póliza',
        messageHTML: html,
        variant: 'info',
        isConfirmation: true,
        customSize: 'max-w-lg',
        beforeClose: async () => {
          return await this.policyCloseAlert();
        }
      });
  }

  policyCloseAlert(): Promise<boolean> {
    return new Promise(resolve => {
      this.alertService
        .confirm(
          '¡IMPORTANTE!',
          'Debe leer la información anterior sobre los valores de la póliza para evitar devoluciones y retrasos en la gestión documental.',
          {
            iconVariant: 'error',
            confirmBtnVariant: 'red',
            cancelBtnText: 'Volver a revisar',
            confirmBtnText: 'Ya leí la información'
          }
        )
        .subscribe(confirmed => {
          resolve(confirmed);
        });
    });
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
      dateSignature: this.convertDate(item.dateSignature),
      dateOfBirth: this.convertDate(item.dateOfBirth),
      dateofRealization: this.convertDate(item.dateofRealization),
      dateVaccination: this.convertDate(item.dateVaccination),
      documentDeliveryDate: this.convertDate(item.documentDeliveryDate),
      expirationDate: this.convertDate(item.expirationDate),
      endorsedSpecialtyDate: this.convertDate(item.endorsedSpecialtyDate),
      epsName: this.sanitizeWithOptions(item.epsName, this.suraArlEntities),
      dateExpedition: this.convertDate(item.dateExpedition),
      lastDosimetryDate: this.convertDate(item.lastDosimetryDate),
      legalRepresentative: item.legalRepresentative,
      NameAlternate: item.NameAlternate,
      receptionDate: this.convertDate(item.receptionDate),
      resolutionOfThePension: item.resolutionOfThePension,
      riskClassifier: this.sanitizeWithOptions(
        item.riskClassifier,
        this.riskClassifierOptions
      ),
      validityStartDate: this.convertDate(item.validityStartDate),
      amountPolicy: amountPolicy,
      idDocumentType: item.idDocumentType
    });
  }

  /**
   * Carga un archivo y lo envia al api de carga de documentos
   * @param event - evento del input que contiene el archivo para cargar
   * @param item - elemento de la lista para saber cual documento de carga ej (cedula, nit, rethus)
   */
  loadFile(file: any) {
    if (file) this.loadedFile = file;
  }

  createFormData(): FormData {
    const dataToUpload = new FormData();
    const unifiedData: any = {};

    if (this.loadedFile) {
      unifiedData['nameDocument'] = this.loadedFile.name;
    }

    const { idProvider, idClientHoneSolutions } = this.clientSelected;
    unifiedData['idProvider'] = idProvider;
    unifiedData['idClientHoneSolutions'] = idClientHoneSolutions;

    // Add form data
    const docForm = { ...this.documentForm.value };
    for (const [key, value] of Object.entries(docForm)) {
      if (value && value instanceof Date) {
        unifiedData[key] = value.toString().split('T')[0];
      } else if (value != null && value.toString().trim() != '') {
        let appendValue: any = value;
        if (key === 'amountPolicy') {
          appendValue = this.formUtils.sanitizeToNumeric(
            value.toString(),
            true
          );
        }
        unifiedData[key] = appendValue;
      } else {
        // unifiedData[key] = '';
      }
    }

    for (const [key, value] of Object.entries(unifiedData)) {
      dataToUpload.append(key, String(value));
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
    this.formUtils.markFormTouched(this.documentForm);
    if (this.documentForm.invalid) return;
    else if (this.isNew && !this.loadedFile) {
      this.alertService.warning(
        '¡Aviso!',
        'Debe seleccionar un documento.',
      );
      return;
    }
    this.loader = true;

    const fileToUpload = this.createFormData();

    if (this.isNew) {
      this.saveDocument(fileToUpload);
      return;
    }

    this.documentService
      .updateDocuments(this.currentDoc.idDocumentsProvider, fileToUpload)
      .subscribe({
        next: (res: any) => {
          this.loader = false;
          this.alertService.success(
            '¡Actualizado!',
            'El documento se actualizó correctamente.',
          );
          this.closeModal(true);
        },
        error: (error: any) => {
          this.alertService.error(
            '¡Error!',
            'Lo sentimos, hubo un error en el servidor.',
          );
          this.loader = false;
        }
      });
  }

  saveDocument(fileToUpload: FormData) {
    this.documentService.uploadDocuments(fileToUpload).subscribe({
      next: (res: any) => {
        this.loader = false;
        this.alertService.success(
          '¡Carga exitosa!',
          'El documento se subió de manera satisfactoria.',
        )
        this.closeModal(true);
      },
      error: (error: any) => {
        this.loader = false;
        this.alertService.error(
          '¡Error!',
          'Lo sentimos, hubo un error en el servidor.',
        );
      }
    });
  }

  convertDate(date: any) {
    if (!date) return '';

    if (date.length > 10) {
      return date.split('T')[0];
    }
    return date;
  }
}
