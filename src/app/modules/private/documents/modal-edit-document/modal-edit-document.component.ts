import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NgZorroModule } from '../../../../ng-zorro.module';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { DocumentsCrudService } from '../../../../services/documents/documents-crud.service';
import { EventManagerService } from '../../../../services/events-manager/event-manager.service';
import { FileSelectDirective } from 'src/app/directives/file-select.directive';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';
import { formatListWithY, pluralize } from 'src/app/utils/string-utils';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { TextInputComponent } from 'src/app/shared/components/text-input/text-input.component';
import { InputErrorComponent } from 'src/app/shared/components/input-error/input-error.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { SelectComponent } from 'src/app/shared/components/select/select.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { AlertService } from 'src/app/services/alert/alert.service';
import { FileDropDirective } from 'src/app/directives/file-drop.directive';


@Component({
  selector: 'app-modal-edit-document',
  standalone: true,
  imports: [
    NgZorroModule,
    CommonModule,
    PipesModule,
    FileSelectDirective,
    FileDropDirective,
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
  @Input() citiesList: any[] = [];

  clientSelected: any = this.eventManager.clientSelected();

  customErrorMessagesMap: { [key: string]: any } = {
    dateExpedition: {
      dateExpeditionInvalid: (error: string) => error
    },
    expirationDate: {
      minDate: (error: string) => error
    },
    amountPolicy: {
      minPolicy: (error: string) => error
    },
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
  policyCompanies: string[] = [
    'Suramericana',
    'Seguros del estado',
    'Mapre',
    'Seguros Mundial',
    'HDI',
    'Axa colpatria',
    'Aurora',
    'Chubb',
    'Previsora',
    'Seguros Bolivar',
    'Solidaria',
    'Otra',
  ];
  riskClassifierOptions = ['1', '2', '3', '4', '5'];

  readonly SMLV: number = 1423500;
  readonly idMainCities: number[] = [
    88, // Barranquilla
    107, // Bogota
    150, // Cali
    547, // Medellin
  ];
  mainCities: any[] = [];
  readonly typePolicyProviderConfig: { [key: string]: any } = {
    // Juridica
    'Clinica': {
      idTypeProvider: 3,
      smlvMainCities: 420,
      smlvOtherCities: 370,
    },
    'Hospital': {
      idTypeProvider: 3,
      smlvMainCities: 420,
      smlvOtherCities: 370,
    },
    'IPS Ambulatoria': {
      idTypeProvider: 3,
      smlvMainCities: 370,
      smlvOtherCities: 230,
    },

    // Natural
    'Profesional médico': {
      idTypeProvider: 7,
      smlvMainCities: 230,
      smlvOtherCities: 200,
    },
    'Odontologo': {
      idTypeProvider: 7,
      smlvMainCities: 230,
      smlvOtherCities: 200,
    },
    'Terapeuta': {
      idTypeProvider: 7,
      smlvMainCities: 200,
      smlvOtherCities: 100,
    },
    'Psicólogo': {
      idTypeProvider: 7,
      smlvMainCities: 200,
      smlvOtherCities: 100,
    },
    'Fonoaudiólogo': {
      idTypeProvider: 7,
      smlvMainCities: 200,
      smlvOtherCities: 100,
    },
    'Nutricionista': {
      idTypeProvider: 7,
      smlvMainCities: 200,
      smlvOtherCities: 100,
    },
  };
  typePolicyProviderOptions: string[] = [];

  hasShownAmountMessage: boolean = false;

  @ViewChild('dateInput', { static: true }) dateInputRef!: ElementRef;

  constructor(
    private modalRef: ModalComponent,
    private formBuilder: FormBuilder,
    private documentService: DocumentsCrudService,
    private eventManager: EventManagerService,
    private alertService: AlertService,
    private formUtils: FormUtilsService
  ) { }

  ngOnInit(): void {
    // console.log('currentDoc', this.currentDoc);
    this.getTypePolicyProviderOpts();
    this.createForm();
  }

  closeModal(response: boolean = false): void {
    this.modalRef.close({ response });
  }

  getTypePolicyProviderOpts() {
    const idTypeProvider = this.clientSelected?.idTypeProvider;
    if (!idTypeProvider) return;

    this.typePolicyProviderOptions = Object.keys(this.typePolicyProviderConfig)
      .filter(opt => this.typePolicyProviderConfig[opt].idTypeProvider === idTypeProvider);
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
      expirationDate: ['', [
        Validators.required,
        this.expirationDateValidator
      ]],
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
      policyCompany: ['', [Validators.required]],
      idCity: ['', [Validators.required]],
      typePolicyProvider: ['', [Validators.required]],
      amountPolicy: ['', [
        Validators.required,
        this.minPolicyDynamicValidator.bind(this)
      ]],
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

    this.documentForm.get('idCity')?.valueChanges.subscribe(() => {
      this.documentForm.get('amountPolicy')?.updateValueAndValidity();
    });
    this.documentForm.get('typePolicyProvider')?.valueChanges.subscribe(() => {
      this.documentForm.get('amountPolicy')?.updateValueAndValidity();
    });

    if (this.currentDoc && !this.isNew) this.patchForm();
  }

  /**
   * Checks if the field is required for the document type
   */
  isFieldRequiredForDocumentType(controlName: string): boolean {
    const item = this.currentDoc;
    if (!item.showInProviderSystem) return false;
    const documentValidationMap: any = {
      software: item.withSoftwareMedicalRecord,
      dateExpedition: item.withExpedition,
      dateDiligence: item.withDateDiligence,
      dateSignature: item.withDateSignature,
      dateVaccination: item.withDateVaccination,
      expirationDate: item.withExpiration,
      legalRepresentative: item.withLegalRepresentative,
      NameAlternate: item.withLegalRepresentative,
      documentDeliveryDate: item.withDeliveryDate,
      dateOfBirth: item.withDateOfBirth,
      consultationDate: item.withConsultationDate,
      endorsedSpecialtyDate: item.withEndorsedSpecialtyDate,
      validityStartDate: item.withValidityStartDate,
      dateofRealization: item.withDateofRealization,
      receptionDate: item.withReceptionDate,
      epsName: item.withEpsName,
      riskClassifier: item.withRiskClassifier && item.riskClassifier !== '9',
      resolutionOfThePension: item.withResolutionOfThePension,
      policyCompany: item.withAmountPolicy,
      idCity: item.withAmountPolicy,
      typePolicyProvider: item.withAmountPolicy,
      amountPolicy: item.withAmountPolicy
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

  expirationDateValidator(control: AbstractControl) {
    if (!control.value) return null;

    const selectedDate = new Date(control.value + 'T00:00:00');
    const today = new Date();
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // expirationDate must be greater than today
    return selectedDate < tomorrow
      ? { minDate: 'Debe ser posterior al día de hoy' }
      : null;
  }

  minPolicyDynamicValidator(control: AbstractControl): ValidationErrors | null {
    if (!control || !control.parent) return null;

    const form = control.parent as FormGroup;
    const type = form.get('typePolicyProvider')?.value;
    const idCity = form.get('idCity')?.value;

    if (!type || !idCity) return null;

    const config = this.typePolicyProviderConfig[type];
    if (!config) return null;

    const isMainCity = this.idMainCities.includes(Number(idCity));
    const smlvNum = isMainCity ? config.smlvMainCities : config.smlvOtherCities;

    const value = Number(
      this.formUtils.sanitizeToNumeric(String(control.value), true)
    );
    if (value == null || isNaN(value)) return null;

    const min = this.SMLV * smlvNum;
    const minFormatted = this.formUtils.formatCurrency(min);
    return value < min
      ? { minPolicy: `Mínimo permitido: $ ${minFormatted}` }
      : null;
  }

  patchForm() {
    const item = this.currentDoc;

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
      policyCompany: this.sanitizeWithOptions(
        item.policyCompany,
        this.policyCompanies
      ),
      idCity: item.idCity,
      typePolicyProvider: this.sanitizeWithOptions(
        item.typePolicyProvider,
        this.typePolicyProviderOptions
      ),
      amountPolicy: this.formUtils.formatCurrency(item.amountPolicy),
      idDocumentType: item.idDocumentType
    });
  }

  onAmountPolicyChange(): void {
    const control = this.documentForm.get('amountPolicy');
    let value = control?.value;
    const formatted = this.formUtils.formatCurrency(value);
    control?.setValue(formatted, { emitEvent: false });
  }

  hasAmountPolicyValidation(): boolean {
    if (!this.clientSelected?.idTypeProvider) return false;
    return Object.values(this.typePolicyProviderConfig).some(
      (config: any) => config.idTypeProvider === this.clientSelected.idTypeProvider
    );
  }

  getMainCities() {
    if (this.citiesList?.length) {
      this.mainCities = this.citiesList.filter(city =>
        this.idMainCities.includes(city.idCity)
      );
    }
  }

  amountPolicyInfoAlert(onFocus: boolean = false): void {
    if (!this.hasAmountPolicyValidation()
      || (onFocus && this.hasShownAmountMessage)) return;
    this.hasShownAmountMessage = true;

    this.getMainCities();

    // Group by SMLVs num min
    const grouped: Record<string, { smlvMain: number, smlvOther: number, types: string[] }> = {};
    for (let [type, config] of Object.entries(this.typePolicyProviderConfig)) {
      if (config.idTypeProvider !== this.clientSelected.idTypeProvider) continue;

      const key = `${config.smlvMainCities}-${config.smlvOtherCities}`;
      if (!grouped[key]) {
        grouped[key] = {
          smlvMain: config.smlvMainCities,
          smlvOther: config.smlvOtherCities,
          types: []
        };
      }
      grouped[key].types.push(type);
    }

    const mainCitiesNames = this.mainCities
      .map(city => city.city)
      .sort();

    // Generate dinamic message
    let html = `<p class="font-bold">Valores mínimos requeridos</p>`;
    html += `<p><span class="font-semibold">Ciudades principales:</span> ${mainCitiesNames.join(', ')}.</p>`;
    for (let group of Object.values(grouped)) {
      const valueMain = group.smlvMain * this.SMLV;
      const valueOther = group.smlvOther * this.SMLV;
      html += `
        <p class="mt-2">
          Para <strong>${formatListWithY(group.types)}</strong>:
          <ul class="list-disc list-inside mt-1">
            <li><strong>${group.smlvMain} SMLV</strong> en ciudades principales (<strong>$${valueMain.toLocaleString('es-CO')}</strong>)</li>
            <li><strong>${group.smlvOther} SMLV</strong> en otras ciudades (<strong>$${valueOther.toLocaleString('es-CO')}</strong>)</li>
          </ul>
        </p>
      `;
    }
    html += `<p class="mt-3">Por favor verifica este monto según el tipo de prestador y la ciudad correspondiente.</p>`;

    this.alertService.showAlert({
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

  submitRequest() {
    this.formUtils.markFormTouched(this.documentForm);
    if (this.documentForm.invalid) return;
    else if (!this.loadedFile && (this.isNew || this.currentDoc.documentStatus === 'VENCIDO')) {
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

    this.documentService.updateDocuments(this.currentDoc.idDocumentsProvider, fileToUpload)
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
