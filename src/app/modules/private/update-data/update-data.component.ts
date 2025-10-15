import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
import { ClientProviderService } from 'src/app/services/client-provider/client-provider.service';
import { LANGUAGES } from 'src/app/constants/languages';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';
import { format } from 'date-fns';
import { BackendErrorsComponent } from 'src/app/shared/components/backend-errors/backend-errors.component';
import { debounceTime, firstValueFrom, fromEvent } from 'rxjs';
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
import { CatalogService } from 'src/app/services/catalog/catalog.service';
import { ProviderService } from 'src/app/services/provider/provider.service';

@Component({
  selector: 'app-update-data',
  standalone: true,
  imports: [CommonModule, BackendErrorsComponent, ButtonComponent, AlertComponent, RouterModule, ProviderFormComponent, OfficeListComponent, ContactListComponent],
  templateUrl: './update-data.component.html',
  styleUrl: './update-data.component.scss'
})
export class UpdateDataComponent implements OnInit, AfterViewInit, OnDestroy, CanComponentDeactivate {

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
  hasSectionBackendError: boolean = false;

  private formSubscription: any;

  steps = [
    {
      key: 'provider',
      label: 'Información del prestador',
      enabled: true,
      valid: false,
      icon: '/assets/icons/outline/general.svg#briefcase',
    },
    {
      key: 'offices',
      label: 'Sedes de prestación',
      enabled: false,
      valid: false,
      icon: '/assets/icons/outline/general.svg#map-pin-alt',
    },
    {
      key: 'contacts',
      label: 'Contactos',
      enabled: false,
      valid: false,
      icon: '/assets/icons/outline/general.svg#phone',
    },
  ];
  activeStep: string = 'provider';

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

  atStart: boolean = true;
  atEnd: boolean = false;

  visibleIndex = 0;

  progressPercentage: number = 0;

  @ViewChild('stepsContainer') stepsContainer!: ElementRef<HTMLDivElement>;
  @ViewChildren('stepBtn') stepBtns!: QueryList<ElementRef<HTMLDivElement>>;

  constructor(
    public eventManager: EventManagerService,
    private fb: FormBuilder,
    private formUtils: FormUtilsService,
    private toastService: ToastService,
    private clientProviderService: ClientProviderService,
    private authService: AuthService,
    private router: Router,
    private navigationService: NavigationService,
    private alertService: AlertService,
    private catalogService: CatalogService,
    private providerService: ProviderService,
  ) { }

  ngOnInit(): void {
    this.providerForm = this.fb.group({});

    this.getIdentificationTypes();
    this.initializeForm();

    this.getCompanies();

    this.loadFormData();
  }

  ngAfterViewInit(): void {
    this.updateArrows(true);

    // Update navigation arrows on mobile when scrolling stops
    const container = this.stepsContainer.nativeElement;
    fromEvent(container, 'scroll')
      .pipe(debounceTime(200))
      .subscribe(() => this.updateArrows(false));
  }

  private scrollToIndex(index: number, useDelay = true) {
    this.visibleIndex = index;

    const target = this.stepBtns.toArray()[index]?.nativeElement;
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        inline: 'start', // center
        block: 'nearest'
      });
    }

    this.atStart = this.visibleIndex === 0;
    this.atEnd = this.visibleIndex === this.steps.length - 1;
    this.updateArrows(useDelay);
  }

  scrollStep(direction: 'left' | 'right') {
    if (this.steps.length === 0) return;

    if (direction === 'right' && this.visibleIndex < this.steps.length - 1) {
      this.scrollToIndex(this.visibleIndex + 1);
    } else if (direction === 'left' && this.visibleIndex > 0) {
      this.scrollToIndex(this.visibleIndex - 1);
    }
  }

  updateArrows(useDelay = false) {
    const tolerance = 4;

    const run = () => {
      const parent = this.stepsContainer.nativeElement.parentElement as HTMLElement;
      const steps = this.stepBtns.toArray().map(btn => btn.nativeElement);

      if (!parent || steps.length === 0) return;

      const parentRect = parent.getBoundingClientRect();
      const firstRect = steps[0].getBoundingClientRect();
      const lastRect = steps[steps.length - 1].getBoundingClientRect();

      this.atStart = firstRect.left >= parentRect.left;
      // if (this.atStart) {
      //   this.visibleIndex = 0;
      // }

      this.atEnd = lastRect.right <= parentRect.right + tolerance;
      // if (this.atEnd) {
      //   this.visibleIndex = steps.length - 1;
      // }
    }

    if (useDelay) {
      // With delay, when executing a scroll programmatically
      setTimeout(run, 300);
    } else {
      // No delay, for debounceTime
      run();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeForm();
  }

  async canDeactivate(): Promise<boolean> {
    return !this.hasSavedState() || await firstValueFrom(
      this.alertService.confirm(
        '¡Aviso!', 'Tienes cambios pendientes. ¿Deseas salir?', {
        confirmBtnText: 'Salir',
        cancelBtnText: 'Cancelar',
      })
    );
  }

  @HostListener('window:beforeunload', ['$event'])
  handleUnload($event: BeforeUnloadEvent): void {
    if (this.hasSavedState()) {
      $event.preventDefault();
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.updateArrows();
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

  async goToStep(stepKey: string, canEnable: boolean = false) {
    const stepIndex = this.steps.findIndex(s => s.key === stepKey);
    const step = this.steps[stepIndex];
    if (!step || step.key === this.activeStep) return;

    const currentIndex = this.steps.findIndex(s => s.key === this.activeStep);
    const isGoingBack = stepIndex < currentIndex;

    if (!isGoingBack && this.isFirstForm) {
      let isValid = true;

      switch (this.activeStep) {
        case 'provider':
          isValid = await this.validateProviderForm();
          break;
        case 'offices':
          isValid = this.validateOffices();
          break;
        case 'contacts':
          isValid = this.validateContacts();
          break;
      }

      const activeStepObj = this.steps.find(s => s.key === this.activeStep);
      if (activeStepObj) activeStepObj.valid = isValid;

      if (!isValid) {
        this.disableStepsAfter(this.activeStep);
        this.updateProgress();
        return;
      }
    }

    this.clearSectionBackendError();

    if (step.enabled || canEnable) {
      if (canEnable) step.enabled = true;
      this.activeStep = stepKey;
      this.scrollToIndex(stepIndex, true);
      this.saveFormToLocalStorage();
    }
    this.updateProgress();
  }

  private disableStepsAfter(currentKey: string) {
    const currentIndex = this.steps.findIndex(s => s.key === currentKey);
    if (currentIndex === -1) return;

    this.steps.forEach((s, i) => {
      if (i > currentIndex) s.enabled = false;
    });
  }

  private async restoreSteps() {
    this.steps.forEach(s => {
      s.enabled = false;
      s.valid = false;
    });
    let lastEnableStepIndex = -1;

    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      let isValid = true;

      switch (step.key) {
        case 'provider':
          isValid = await this.validateProviderForm();
          break;
        case 'offices':
          isValid = this.validateOffices();
          break;
        case 'contacts':
          isValid = this.validateContacts();
          break;
      }

      step.enabled = true;
      step.valid = isValid;
      lastEnableStepIndex = i;
      if (!isValid) break;
    }

    if (lastEnableStepIndex >= 0) {
      this.activeStep = this.steps[lastEnableStepIndex].key;
    }
    this.updateProgress();
  }

  updateProgress(isFinal: boolean = false) {
    const totalSteps = this.steps.length;
    if (isFinal) {
      this.progressPercentage = 100;
      return;
    }

    // Find the index of the last enabled step
    // const lastEnabledIndex = this.steps
    //   .map((s, i) => (s.enabled ? i : -1))
    //   .filter(i => i !== -1)
    //   .pop() ?? 0;
    // this.progressPercentage = Math.round(((lastEnabledIndex) / totalSteps) * 100);

    const completedCount = this.steps.filter(s => s.valid).length;
    this.progressPercentage = Math.round((completedCount / totalSteps) * 100);
  }

  validateProviderForm(form: FormGroup = this.providerForm): Promise<boolean> {
    const formControlValues: { [key: string]: any } = {};

    this.providerFormFields.forEach((field: string) => {
      const control = form.get(field);
      control?.markAsTouched();
      control?.updateValueAndValidity();
      formControlValues[field] = control?.value;
    });
    formControlValues['idProvider'] = this.user.id;

    if (this.providerFormFields.some(f => form.get(f)?.invalid)) {
      this.alertService.warning(
        '¡Acción requerida!',
        'Por favor completa los datos del prestador antes de continuar.'
      );
      return Promise.resolve(false);
    }

    this.loading = true;
    return new Promise((resolve) => {
      this.providerService.validateTemporalProviderData(formControlValues).subscribe({
        next: (resp: any) => {
          this.loading = false;
          this.clearSectionBackendError();
          resolve(true);
        },
        error: (err) => {
          this.loading = false;
          if (err.status == 422) {
            this.backendError = err.error;
            this.hasSectionBackendError = true;
            this.alertService.warning(
              '¡Acción requerida!',
              'Por favor ajusta la información del prestador.'
            );
          } else {
            this.alertService.error(
              '¡Error de validación!',
              'Algo salió mal.'
            );
          }
          resolve(false);
        }
      });
    });
  }

  clearSectionBackendError() {
    if (this.hasSectionBackendError) {
      this.backendError = null;
    }
    this.hasSectionBackendError = false;
  }

  private validateOffices(): boolean {
    if (!this.existingOffices?.length) {
      this.alertService.warning(
        '¡Acción requerida!',
        'Debes agregar al menos una sede de prestación de servicio.'
      );
      return false;
    }

    // Validate incomplete information
    const hasInvalidOffice = this.existingOffices.some(office =>
      (!office.TemporalAddress && !office.address) ||
      (!office.TemporalSchedules?.length && !office.createdSchedules?.length)
    );
    if (hasInvalidOffice) {
      this.alertService.warning(
        '¡Acción requerida!',
        'Algunas sedes tienen información incompleta.'
      );
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

      this.alertService.warning(
        '¡Acción requerida!',
        `Debes agregar las siguientes compañías asociadas a alguna sede: ${names}`
      );
      return false;
    }

    return true;
  }

  private validateContacts(): boolean {
    if (!this.existingContacts?.length) {
      this.alertService.warning(
        '¡Acción requerida!',
        'Debes agregar al menos un contacto.'
      );
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
      languages: [[], [Validators.required]],
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

  goBack(): void {
    const backRoute = this.navigationService.getBackRoute();
    if (
      (!this.user.withData && backRoute === '/service/documentation') ||
      backRoute === '/support'
    ) {
      this.router.navigateByUrl('/home');
      return;
    }
    this.router.navigateByUrl(backRoute);
  }

  private disableProviderFields() {
    this.providerFormFields.forEach(field => {
      this.providerForm.get(field)?.disable({ emitEvent: false });
    });
  }

  isValidEmail(email: string | undefined): boolean {
    if (!email || typeof email != 'string') return false;
    return isEmail(email || '');
  }

  getIdentificationTypes() {
    this.catalogService.getDocTypes().subscribe({
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
      await firstValueFrom(
        this.alertService.confirm(
          'Formulario requerido',
          'Por favor, complete el formulario antes de continuar.',
          { cancelBtnText: null }
        )
      );
    }
    this.loadProviderData();
  }

  saveFormToLocalStorage(): void {
    if (!this.isFirstForm) return;
    const newState = {
      formValue: this.providerForm.getRawValue(),
      existingOffices: this.existingOffices,
      existingContacts: this.existingContacts,
      activeStep: this.activeStep,
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
  async restoreFormFromLocalStorage() {
    if (!this.hasSavedState()) {
      this.subscribeOnChange();
      return;
    }
    const confirmed = await firstValueFrom(
      this.alertService.confirm(
        '¡Aviso!', 'Se encontraron datos sin guardar de una sesión anterior. ¿Deseas continuar con estos datos?', {
        confirmBtnText: 'Continuar',
        cancelBtnText: 'No',
      })
    );
    if (!confirmed) {
      this.subscribeOnChange();
      return;
    }

    const storageState = localStorage.getItem('formState');
    if (!storageState) return;
    const state = JSON.parse(storageState);
    const formState = state.formValue;

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

    this.activeStep = state.activeStep;
    this.restoreSteps();
  }

  private restoreFormArray(field: string, items: any[]) {
    const formArray = this.fb.array(items.map(item => this.fb.nonNullable.control(item)));
    this.providerForm.setControl(field, formArray);
  }

  loadProviderData(): void {
    this.loading = true;
    this.providerService.getTemporalProviderData(this.user.id).subscribe({
      next: (res: any) => {
        this.loading = false;
        const user = this.user;

        const data = res.data;
        if (!data) {
          this.isFirstForm = true;
          user.withData = false;
          this.authService.saveUserLogged(user);
          this.restoreFormFromLocalStorage();
          return;
        };

        this.isFirstForm = false;
        user.withData = true;
        this.authService.saveUserLogged(user);
        this.removeFormState();
        this.disableProviderFields();

        // Enable all modules
        this.steps.forEach(step => step.enabled = true);

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

        user.rejected = res.rejected;
        this.authService.saveUserLogged(user);

        if (this.user.rejected && data.status === "Rechazado" && data.Reasons.length) {
          this.alertService.warning('Actualización requerida', `Motivo: ${data.Reasons[0].reason}`);
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

  successToast(message: string) {
    if (!this.isFirstForm) return;
    this.toastService.success(message, { color: 'info' });
  }

  async deleteContact(index: number) {
    const confirmed = await firstValueFrom(
      this.alertService.confirmDelete(
        '¿Eliminar contacto?',
        'Eliminar contacto del listado'
      )
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
    this.successToast('Contacto por eliminar.');
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
      this.alertService.warning(
        '¡Acción requerida!',
        'Formulario incompleto, faltan algunos campos por diligenciar.'
      );
      return;
    };

    // Clear messages
    this.toastService.clear();
    this.backendError = null;

    // Validate offices and contacts
    if (
      !this.validateOffices() ||
      !this.validateContacts()
    ) return;

    const website = this.providerForm.get('website')?.value?.toLowerCase() || null;
    const email = this.providerForm.get('email')?.value?.toLowerCase() || null;
    this.providerForm.patchValue({
      email: email,
      website: website,
      endTime: this.formatDate(new Date())
    });

    const serviceMethod = (args: any) =>
      this.isFirstForm
        ? this.providerService.sendTemporalProviderForm(args)
        : this.providerService.updateTemporalProviderForm(args);

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
          if (this.isFirstForm) {
            this.updateProgress(true);
            this.alertService.success(
              '¡Guardado exitoso!',
              '¡Bienvenido/a! Toda tu información está registrada.'
            );
          } else {
            this.alertService.success(
              '¡Guardado exitoso!',
              'Actualizamos tu perfil correctamente.'
            );
          }
          this.resetForm();
        },
        error: (err: any) => {
          this.loading = false;
          if (err.status == 422) this.backendError = err.error;
          console.error(err);
          this.alertService.error();
          if (!this.isFirstForm) {
            this.resetForm();
          }
        }
      });
    }, 550);
  }

}
