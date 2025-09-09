import { CommonModule, Location } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
import { OfficeModalComponent } from './office-modal/office-modal.component';
import { ClientProviderService } from 'src/app/services/clients/client-provider.service';
import { LANGUAGES } from 'src/app/constants/languages';
import { ContactFormComponent } from './contact-form/contact-form.component';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';
import { AlertNzService } from 'src/app/services/alert-nz/alert-nz.service';
import { format } from 'date-fns';
import { BackendErrorsComponent } from 'src/app/shared/components/backend-errors/backend-errors.component';
import { debounceTime, firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { CanComponentDeactivate } from 'src/app/guards/can-deactivate.interface';
import { Router, RouterModule } from '@angular/router';
import { NavigationService } from 'src/app/services/navigation/navigation.service';
import { isEmail } from 'src/app/utils/validation-utils';
import { ClientInterface } from 'src/app/models/client.interface';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { AlertComponent } from 'src/app/shared/components/alert/alert.component';
import { ProviderFormComponent } from './provider-form/provider-form.component';
import { OfficeListComponent } from './office-list/office-list.component';
import { ContactListComponent } from './contact-list/contact-list.component';
import { AlertService } from 'src/app/services/alert/alert.service';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-update-data',
  standalone: true,
  imports: [NgZorroModule, CommonModule, BackendErrorsComponent, ButtonComponent, AlertComponent, RouterModule, ProviderFormComponent, OfficeListComponent, ContactListComponent],
  templateUrl: './update-data.component.html',
  styleUrl: './update-data.component.scss'
})
export class UpdateDataComponent implements OnInit, OnDestroy, CanComponentDeactivate {

  user = this.eventManager.userLogged();
  providerForm!: FormGroup;
  isFirstForm: boolean = true;

  languages: any[] = LANGUAGES;
  identificationTypes: any[] = [];
  providerCompanies: any[] = [];

  existingOffices: any[] = [];
  existingContacts: any[] = [];

  officePage: number = 1;
  officePageSize: number = 5;

  contactPage: number = 1;
  contactPageSize: number = 5;

  loading: boolean = false;
  backendError: any = null;
  // backendError: any = {
  //   error: {
  //     details: [
  //       { message: 'Primer número de la placa debe ser positivo' },
  //       { message: 'El "Nombre o Razón social" ya existe en la base de datos' },
  //     ]
  //   }
  // };

  private formSubscription: any;

  emailInfoMessage: string[] = [
    "Correo único corporativo o personal del prestador.",
    "En caso de que administres o gestiones mas de un prestador, asegúrate de que el correo electrónico registrado sea el personal o corporativo correspondiente a cada uno de ellos."
  ];

  steps = [
    {
      key: 'provider',
      label: 'Información del prestador',
      enabled: true,
      icon: '/assets/icons/outline/general.svg#briefcase',
    },
    {
      key: 'offices',
      label: 'Sedes de prestación',
      enabled: false,
      icon: '/assets/icons/outline/general.svg#map-pin-alt',
    },
    {
      key: 'contacts',
      label: 'Contactos',
      enabled: false,
      icon: '/assets/icons/outline/general.svg#phone',
    },
  ];
  activeStep: string = 'offices';

  providerFormFields: string[] = [
    'name',
    'email',
    'languages',
    'idTypeDocument',
    'identification',
    'dv',
    'repsEnableCode',
    'website',
  ];

  constructor (
    private eventManager: EventManagerService,
    private fb: FormBuilder,
    private formUtils: FormUtilsService,
    private toastService: ToastService,
    private alertNzService: AlertNzService,
    private modalService: NzModalService,
    private clientProviderService: ClientProviderService,
    private authService: AuthService,
    private router: Router,
    private navigationService: NavigationService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.providerForm = this.fb.group({});

    this.getIdentificationTypes();
    this.initializeForm();

    this.getCompanies();

    // return;
    this.loadFormData();

  }

  ngOnDestroy(): void {
    this.unsubscribeForm();
  }

  async canDeactivate(): Promise<boolean> {
    return !this.hasSavedState() || await this.alertNzService.confirm(
      'Aviso', 'Tienes cambios pendientes. ¿Deseas salir?', {
        nzOkText: 'Salir',
        nzCancelText: 'Cancelar',
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  handleUnload($event: BeforeUnloadEvent): void {
    if (this.hasSavedState()) {
      $event.preventDefault();
    }
  }

  subscribeOnChange() {
    this.formSubscription = this.providerForm.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      if (!this.providerForm.get('updatedBasicData')?.value) {
        // Check if any of these specific controls have changed
        const updatedBasicData = this.providerFormFields.some(key => {
          const control = this.providerForm.get(key);
          return control?.dirty;
        });
        this.providerForm.patchValue({ updatedBasicData }, { emitEvent: false });
      }

      this.saveFormToLocalStorage();
    });
  }

  unsubscribeForm() {
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
  }

  // goPrevStep() {
  //   if (this.activeStep === 'contacts') {
  //     this.activeStep = 'offices';
  //   } else if (this.activeStep === 'offices') {
  //     this.activeStep = 'provider';
  //   }
  // }

  // goNextStep() {
  //   if (this.activeStep === 'provider') {
  //     this.goToStep('offices', true);
  //   } else if (this.activeStep === 'offices') {
  //     this.goToStep('contacts', true);
  //   }
  // }

  goToStep(stepKey: string, canEnable: boolean = false) {
    const step = this.steps.find(s => s.key === stepKey);
    if (!step || step.key === this.activeStep) return;

    if (this.activeStep === 'provider' && !this.validateProviderForm()) {
      return;
    }
    if (this.activeStep === 'offices' && !this.validateOffices()) {
      return;
    }
    if (this.activeStep === 'contacts' && !this.validateContacts()) {
      return;
    }

    if (step.enabled) {
      this.activeStep = stepKey;
    } else if (canEnable) {
      step.enabled = true;
      this.activeStep = stepKey;
    }
  }

  private validateProviderForm(): boolean {
    this.providerFormFields.forEach(field => {
      const control = this.providerForm.get(field);
      control?.markAsTouched();
      control?.updateValueAndValidity();
    });

    if (this.providerFormFields.some(f => this.providerForm.get(f)?.invalid)) {
      this.alertService.warning(
        'Datos incompletos',
        'Por favor completa los datos del prestador antes de continuar.'
      );
      return false;
    }
    return true;
  }

  private validateOffices(): boolean {
    if (!this.existingOffices?.length) {
      this.alertService.warning('Sedes incompletas', 'Debes registrar al menos una sede.');
      return false;
    }

    // Validate incomplete information
    const hasInvalidOffice = this.existingOffices.some(office =>
      (!office.TemporalAddress && !office.address) ||
      (!office.TemporalSchedules?.length && !office.createdSchedules?.length)
    );
    if (hasInvalidOffice) {
      this.alertNzService.warning('Aviso', 'Algunas sedes tienen información incompleta.');
      return false;
    }

    // Validate that the offices are associated with the provider companies
    const companiesIds = this.providerCompanies.map((c: any) => c.idCompany);
    const companiesNotLinked: number[] = [];
    companiesIds.forEach(companyId => {
      const isLinked = this.existingOffices.some(office => {
        if (office.idsCompanies) {
          return office.idsCompanies.includes(companyId);
        } else if (office.Companies) {
          return office.Companies.some((company: any) => company.idCompany === companyId);
        }
        return false;
      });
      if (!isLinked) {
        companiesNotLinked.push(companyId);
      }
    });

    if (companiesNotLinked.length > 0) {
      const names = this.providerCompanies
        .filter(c => companiesNotLinked.includes(c.idCompany))
        .map(c => c.name)
        .join(', ');

      this.alertNzService.warning(
        'Aviso',
        `Debes agregar las siguientes compañías asociadas a alguna sede: ${names}`
      );
      return false;
    }

    return true;
  }

  private validateContacts(): boolean {
    if (!this.existingContacts?.length) {
      this.alertService.warning('Contactos incompletos', 'Debes registrar al menos un contacto.');
      return false;
    }
    return true;
  }

  initializeForm() {
    const dvValue = this.user.dv != null && this.user.dv !== '' && !isNaN(Number(this.user.dv))
      ? Number(this.user.dv)
      : null;

    const isValidEmail = this.isValidEmail(this.user.email);

    this.providerForm = this.fb.group({
      idProvider: [this.user.id],
      startTime: [this.formatDate(new Date())],
      endTime: [''],
      name: [
        { value: this.user.name || '', disabled: true },
        [Validators.required]
      ],
      email: [
        {
          value: isValidEmail ? this.user.email : '',
          disabled: isValidEmail
        },
        [Validators.required, this.formUtils.email]
      ],
      languages: [[], [Validators.required]],
      idTypeDocument: [
        { value: this.user.idTypeDocument || '', disabled: true },
        [Validators.required]
      ],
      identification: [
        { value: this.user.identificacion || '', disabled: true },
        [Validators.required, this.formUtils.numeric]
      ],
      dv: [
        { value: dvValue, disabled: dvValue != null },
        [this.dvValidator]
      ],
      repsEnableCode: [
        { value: this.user.repsEnableCode || '', disabled: !!this.user.repsEnableCode },
        [Validators.required]
      ],
      website: ['', this.formUtils.url],

      updatedBasicData: [false],

      updatedOffices: this.fb.array([]),
      createdOffices: this.fb.array([]),
      deletedOffices: this.fb.array([]),

      updatedContacts: this.fb.array([]),
      createdContacts: this.fb.array([]),
      deletedContacts: this.fb.array([])
    });

    this.providerForm.get('idTypeDocument')?.valueChanges.subscribe(value => {
      if (value === 6) this.providerForm.patchValue({ dv: null });
    });
  }

  dvValidator(control: AbstractControl) {
    if (!control.value) return null;
    if (control.value < 0 || control.value > 9) {
      return { invalidDigit: 'Debe ser un número entre 0 y 9.' };
    }
    return null;
  }

  async goBack(): Promise<void> {
    const backRoute = this.navigationService.getBackRoute();
    if (!this.user.withData && backRoute === '/service/documentation') {
      this.router.navigateByUrl('/home');
      return;
    }
    this.router.navigateByUrl(backRoute);
  }

  enableFormControls() {
    Object.values(this.providerForm.controls).forEach(control => control.enable());
  }

  isValidEmail(email: string | undefined): boolean {
    if (!email || typeof email != 'string') return false;
    return isEmail(email || '');
  }

  getIdentificationTypes() {
    this.clientProviderService.getIdentificationTypes().subscribe({
      next: (res: any) => {
        this.identificationTypes = res;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  getCompanies() {
    this.loading = true;
    this.clientProviderService.getClientListByProviderId(this.user.id).subscribe({
      next: (res: ClientInterface[]) => {
        const clientList = res;
        const clientsIds = clientList.map((client: any) => client.idClientHoneSolutions);
        this.getProviderCompanies(clientsIds);
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  getProviderCompanies(clientsIds: number[]) {
    this.clientProviderService.getCompaniesByIdClients({ clientsIds }).subscribe({
      next: (res: any) => {
        this.providerCompanies = res.data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  async loadFormData() {
    if (!this.user.withData) {
      await firstValueFrom(this.alertNzService.info('Formulario requerido', 'Por favor, complete el formulario antes de continuar.').afterClose);
    }

    if (this.hasSavedState()) {
      if (!this.user.rejected) {
        const confirmed = await this.alertNzService.confirm(
          'Aviso', 'Se encontraron datos sin guardar de una sesión anterior. ¿Deseas continuar con estos datos?', {
            nzOkText: 'Continuar',
            nzCancelText: 'No',
        });
        if (confirmed) {
          this.restoreFormFromLocalStorage();
          return;
        }
      }
      this.removeFormState();
    }
    this.loadProviderData();
  }

  saveFormToLocalStorage(): void {
    const newState = {
      formValue: this.providerForm.getRawValue(),
      existingOffices: this.existingOffices,
      existingContacts: this.existingContacts,
      isFirstForm: this.isFirstForm
    };
    localStorage.setItem('formState', JSON.stringify(newState));
  }
  removeFormState() {
    localStorage.removeItem('formState');
  }
  hasSavedState(): boolean {
    const savedState = localStorage.getItem('formState');
    if (savedState) {
      return true;
    }
    return false;
  }
  restoreFormFromLocalStorage() {
    const storageState = localStorage.getItem('formState');
    if (!storageState) return;
    const state = JSON.parse(storageState);
    const formState = state.formValue;

    this.isFirstForm = state.isFirstForm;
    if (this.isFirstForm === false) {
      this.enableFormControls();
    }

    this.providerForm.patchValue({
      startTime: formState.startTime,
      email: formState.email,
      name: formState.name,
      languages: formState.languages,
      idTypeDocument: formState.idTypeDocument,
      identification: formState.identification,
      dv: formState.dv,
      repsEnableCode: formState.repsEnableCode,
      website: formState.website,
      updatedBasicData: formState.updatedBasicData,
    });
    this.existingOffices = state.existingOffices;
    this.existingContacts = state.existingContacts;

    ['createdOffices', 'updatedOffices', 'createdContacts', 'updatedContacts'].forEach(field => {
      if (formState[field] && formState[field]?.length) {
        this.restoreFormArray(field, formState[field]);
      }
    });

    // Load deletedArrays
    if (formState.deletedOffices) {
      const deletedOfficesArray = this.providerForm.get('deletedOffices') as FormArray;
      formState.deletedOffices.forEach((officeId: string) => {
        deletedOfficesArray.push(this.fb.control(officeId));
      });
    }
    if (formState.deletedContacts) {
      const deletedContactsArray = this.providerForm.get('deletedContacts') as FormArray;
      formState.deletedContacts.forEach((contactId: string) => {
        deletedContactsArray.push(this.fb.control(contactId));
      });
    }

    this.subscribeOnChange();
  }

  private restoreFormArray(field: string, items: any[]) {
    const formArray = this.fb.array(items.map(item => this.fb.nonNullable.control(item)));
    this.providerForm.setControl(field, formArray);
  }

  loadProviderData(): void {
    this.loading = true;
    this.clientProviderService.getTemporalProviderData(this.user.id).subscribe({
      next: (res: any) => {
        const data = res.data;
        this.loading = false;
        if (!data) {
          this.subscribeOnChange();
          return;
        };

        this.isFirstForm = false;
        this.enableFormControls();

        // Convert to an array
        let languages = [];
        if (typeof data.languages === 'string') {
          try {
            languages = JSON.parse(data.languages);
            if (!Array.isArray(languages)) {
              languages = [];
            }
          } catch (error) {
            console.error("Error parsing languages:", error);
            languages = [];
          }
        } else if (Array.isArray(data.languages)) {
          languages = data.languages;
        }

        this.providerForm.patchValue({
          email: data.email,
          name: data.name,
          languages: languages,
          idTypeDocument: data.idTypeDocument,
          identification: data.identification,
          dv: data.dv,
          repsEnableCode: data.repsEnableCode,
          website: data.website
        });

        this.existingOffices = data.TemporalOffices.map((office: any) => {
          if (office.TemporalAddress?.City) {
            return {
              ...office,
              idCity: office.TemporalAddress.City.idCity,
              cityName: office.TemporalAddress.City.city,
              address: office.TemporalAddress,
            };
          }
          return { ...office, idCity: null };
        });
        this.existingContacts = data.TemporalContactsForProvider;

        this.subscribeOnChange();

        // If repsEnableCode is not saved, add it automatically
        if (!this.providerForm.get('repsEnableCode')?.value && this.user.repsEnableCode) {
          this.providerForm.patchValue({
            repsEnableCode: this.user.repsEnableCode,
          });
        }

        const user = this.user;
        user.rejected = res.rejected;
        this.authService.saveUserLogged(user);

        if (this.user.rejected && data.status === "Rechazado" && data.Reasons.length) {
          this.alertNzService.warning('Actualización requerida', `Motivo: ${data.Reasons[0].reason}`);
        }
      },
      error: (err: any) => {
        this.loading = false;
        console.error(err);
        this.toastService.error('Algo salió mal.');
      }
    });
  }

  get updatedOffices() {
    return this.providerForm.get('updatedOffices') as FormArray;
  }
  get createdOffices() {
    return this.providerForm.get('createdOffices') as FormArray;
  }
  get deletedOffices() {
    return this.providerForm.get('deletedOffices') as FormArray;
  }

  get updatedContacts() {
    return this.providerForm.get('updatedContacts') as FormArray;
  }
  get createdContacts() {
    return this.providerForm.get('createdContacts') as FormArray;
  }
  get deletedContacts() {
    return this.providerForm.get('deletedContacts') as FormArray;
  }

  onOfficesChanged(updatedList: any[]) {
    this.existingOffices = updatedList;
  }

  onContactsChanged(updatedList: any[]) {
    this.existingContacts = updatedList;
  }

  getGlobalIndex(localIndex: number, currentPage: number, pageSize: number): number {
    return (currentPage - 1) * pageSize + localIndex;
  }

  openContactModal(contactIndex: number | null = null) {
    const contact = contactIndex != null
      ? this.existingContacts[contactIndex]
      : null;

    const modalRef = this.modalService.create<ContactFormComponent, any>({
      nzTitle: contact ? 'Actualizar contacto' : 'Agregar contacto',
      nzContent: ContactFormComponent,
      nzCentered: true,
      nzClosable: true,
      nzMaskClosable: false,
      nzWidth: '650px',
      nzStyle: { 'max-width': '90%', 'margin': '22px 0' },
      nzOnCancel: () => {
        const componentInstance = modalRef.getContentComponent();
        if (componentInstance.hasChanges) {
          this.alertNzService.confirm(
            'Cambios sin guardar',
            'Tienes cambios en el contacto. Si sales sin guardar, se perderán.',
            {
              nzOkText: 'Salir',
              nzCancelText: 'Cancelar',
              nzOnOk: () => {
                modalRef.destroy();
              },
            }
          );
          return false;
        }
        return true; // Close modal
      }
    });
    const instanceModal = modalRef.getContentComponent();
    instanceModal.contactModelType = 'Prestador';
    if (contact) instanceModal.contact = contact;

    modalRef.afterClose.subscribe((result: any) => {
      if (result && result.contact) {
        const newContact = result.contact;

        if (result.isNew && newContact.value.idAddedTemporal) {
          if (contactIndex != null) {
            const createdContactsIndex = this.createdContacts.controls.findIndex(
              (control) => control.value.idAddedTemporal === newContact.value.idAddedTemporal
            );
            (this.createdContacts as FormArray).setControl(createdContactsIndex, newContact);
            this.existingContacts[contactIndex] = newContact.value;
          } else {
            this.createdContacts.push(newContact);
            this.existingContacts.push(newContact.value);
          }
          this.existingContacts = [...this.existingContacts];
          this.toastService.success(
            `Contacto por ${contactIndex != null ? 'actualizar' : 'agregar'}.`,
            { color: 'info' }
          );
        } else if (!result.isNew && contactIndex != null) {
          const updatedContactsIndex = this.updatedContacts.controls.findIndex(
            (control) => control.value.idTemporalContact === newContact.value.idTemporalContact
          );
          if (updatedContactsIndex !== -1) {
            (this.updatedContacts as FormArray).setControl(updatedContactsIndex, newContact);
          } else {
            this.updatedContacts.push(newContact);
          }
          this.existingContacts[contactIndex] = newContact.value;
          this.existingContacts = [...this.existingContacts];
          this.toastService.success('Contacto por actualizar.', { color: 'info' });
        }
      }
    });
  }

  async deleteContact(index: number) {
    const confirmed = await this.alertNzService.confirmDelete(
      '¿Eliminar contacto?',
      'Eliminar contacto del listado'
    );
    if (!confirmed) return;

    const deletedContact = this.existingContacts[index];

    // Remove from existingContacts
    this.existingContacts.splice(index, 1);

    if (deletedContact.idTemporalContact !== null) {
      // Search in updatedContacts and delete if it exists
      const updatedIndex = this.updatedContacts.controls.findIndex(contact =>
        contact.value.idTemporalContact == deletedContact.idTemporalContact
      );
      if (updatedIndex !== -1) {
        this.updatedContacts.removeAt(updatedIndex);
      }
      // Push to deleted array if it already existed
      this.deletedContacts.push(this.fb.control(deletedContact.idTemporalContact));
    } else {
      // Search in createdContacts and delete if it exists
      const createdIndex = this.createdContacts.controls.findIndex(contact =>
        JSON.stringify(contact.value) === JSON.stringify(deletedContact)
      );
      if (createdIndex !== -1) {
        this.createdContacts.removeAt(createdIndex);
      }
    }
    this.existingContacts = [...this.existingContacts];
    this.toastService.success('Contacto por eliminar.', { color: 'info' });
  }

  formatDate(date: Date): string {
    return format(date, 'yyyy-MM-dd HH:mm:ss');
  }

  resetForm() {
    this.unsubscribeForm();
    this.removeFormState();

    const dvValue = this.user.dv != null && this.user.dv !== '' && !isNaN(Number(this.user.dv))
      ? Number(this.user.dv)
      : null;
    const isValidEmail = this.isValidEmail(this.user.email);

    this.providerForm.reset({
      idProvider: this.user.id,
      startTime: this.formatDate(new Date()),
      endTime: '',
      email: isValidEmail ? this.user.email : '',
      name: this.user.name || '',
      languages: [],
      idTypeDocument: this.user.idTypeDocument || '',
      identification: this.user.identificacion || '',
      dv: dvValue,
      repsEnableCode: this.user.repsEnableCode || '',
      website: ''
    }, { emitEvent: false });
    this.formUtils.clearFormArray(this.updatedOffices);
    this.formUtils.clearFormArray(this.createdOffices);
    this.formUtils.clearFormArray(this.deletedOffices);
    this.formUtils.clearFormArray(this.updatedContacts);
    this.formUtils.clearFormArray(this.createdContacts);
    this.formUtils.clearFormArray(this.deletedContacts);
    this.existingOffices = [];
    this.existingContacts = [];
    this.loadProviderData();
  }

  onSubmit(): void {
    this.formUtils.trimFormStrControls(this.providerForm);
    if (this.providerForm.invalid) {
      this.formUtils.markFormTouched(this.providerForm);
      return;
    };

    // Clear messages
    this.toastService.clear();
    this.backendError = null;

    // Validate the existence of offices and contacts
    if (!this.existingOffices?.length) {
      this.alertNzService.warning('Aviso', 'Debe agregar al menos una sede de prestación de servicio.');
      return;
    }
    if (!this.existingContacts?.length) {
      this.alertNzService.warning('Aviso', 'Debe agregar al menos un contacto.');
      return;
    }

    // Validate incomplete information
    const hasInvalidOffice = this.existingOffices.some(office =>
      (!office.TemporalAddress && !office.address) ||
      (!office.TemporalSchedules?.length && !office.createdSchedules?.length)
    );
    if (hasInvalidOffice) {
      this.alertNzService.warning('Aviso', 'Algunas sedes tienen información incompleta.');
      return;
    }

    // Validate that the offices are associated with the provider companies
    const companiesIds = this.providerCompanies.map((c: any) => c.idCompany);
    const companiesNotLinked: number[] = [];
    companiesIds.forEach(companyId => {
      const isLinked = this.existingOffices.some(office => {
        if (office.idsCompanies) {
          return office.idsCompanies.includes(companyId);
        } else if (office.Companies) {
          return office.Companies.some((company: any) => company.idCompany === companyId);
        }
        return false;
      });
      if (!isLinked) {
        companiesNotLinked.push(companyId);
      }
    });

    if (companiesNotLinked.length > 0) {
      const names = this.providerCompanies
        .filter(c => companiesNotLinked.includes(c.idCompany))
        .map(c => c.name)
        .join(', ');

      this.alertNzService.warning(
        'Aviso',
        `Debes agregar las siguientes compañías asociadas a alguna sede: ${names}`
      );
      return;
    }


    const website = this.providerForm.get('website')?.value?.toLowerCase() || null;
    const email = this.providerForm.get('email')?.value?.toLowerCase() || null;
    this.providerForm.patchValue({
      email: email,
      website: website,
      endTime: this.formatDate(new Date())
    });

    const serviceMethod = (args: any) =>
      this.isFirstForm
        ? this.clientProviderService.sendTemporalProviderForm(args)
        : this.clientProviderService.updateTemporalProviderForm(args);

    this.loading = true;

    setTimeout(() => {
      serviceMethod(this.providerForm.getRawValue()).subscribe({
        next: (res: any) => {
          const user = this.user;
          user.rejected = false;
          if (this.isFirstForm || !this.user.withData) {
            user.withData = true;
          }
          this.authService.saveUserLogged(user);

          this.loading = false;
          this.alertNzService.success('Enviado', 'Actualización enviada.');
          this.resetForm();
        },
        error: (err: any) => {
          this.loading = false;
          if (err.status == 422) this.backendError = err.error;
          console.error(err);
          this.alertNzService.error();
        }
      });
    }, 550);
  }

}
