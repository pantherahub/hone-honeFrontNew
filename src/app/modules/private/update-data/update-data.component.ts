import { CommonModule, Location } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
import { OfficeModalComponent } from './office-modal/office-modal.component';
import { ClientProviderService } from 'src/app/services/clients/client-provider.service';
import { LANGUAGES } from 'src/app/utils/languages';
import { ContactFormComponent } from './contact-form/contact-form.component';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AlertService } from 'src/app/services/alerts/alert.service';
import { format } from 'date-fns';
import { BackendErrorsComponent } from 'src/app/shared/forms/backend-errors/backend-errors.component';
import { debounceTime, firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { CanComponentDeactivate } from 'src/app/guards/can-deactivate.interface';
import { Router } from '@angular/router';
import { NavigationService } from 'src/app/services/navigation/navigation.service';

@Component({
  selector: 'app-update-data',
  standalone: true,
  imports: [NgZorroModule, CommonModule, BackendErrorsComponent],
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

  private formSubscription: any;

  showFloatingButton = true;
  @ViewChild('footerButton') footerButton!: ElementRef;

  constructor (
    private eventManager: EventManagerService,
    private fb: FormBuilder,
    private formUtils: FormUtilsService,
    private messageService: NzMessageService,
    private alertService: AlertService,
    private modalService: NzModalService,
    private clientProviderService: ClientProviderService,
    private location: Location,
    private authService: AuthService,
    private router: Router,
    private navigationService: NavigationService,
  ) { }

  ngOnInit(): void {
    this.providerForm = this.fb.group({});

    this.getIdentificationTypes();
    this.initializeForm();

    this.getCompanies();

    this.loadFormData();

  }

  ngOnDestroy(): void {
    this.unsubscribeForm();
  }

  async canDeactivate(): Promise<boolean> {
    return !this.hasSavedState() || await this.alertService.confirm(
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
        const keysToCheck = [
          'name',
          'email',
          'languages',
          'idTypeDocument',
          'identification',
          'dv',
          'repsEnableCode',
          'website'
        ];
        // Check if any of these specific controls have changed
        const updatedBasicData = keysToCheck.some(key => {
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

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.footerButton) return;

    const rect = this.footerButton.nativeElement.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

    this.showFloatingButton = !isVisible;
  }

  scrollToFooter(): void {
    this.footerButton?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    this.highlightSubmitBtn();
  }

  highlightSubmitBtn() {
    const element = this.footerButton?.nativeElement;
    if (element) {
      setTimeout(() => {
        element.classList.add(
          'ring-2',
          'ring-green-400',
          'ring-offset-2',
          'scale-105',
          'transition',
          'duration-500'
        );
      }, 280);

      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-green-400', 'ring-offset-2', 'scale-105');
      }, 2000);
    }
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
      email: [
        {
          value: isValidEmail ? this.user.email : '',
          disabled: isValidEmail
        },
        [Validators.required, this.formUtils.emailValidator]
      ],
      name: [
        { value: this.user.name || '', disabled: true },
        [Validators.required]
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
    this.router.navigateByUrl(backRoute);
  }

  enableFormControls() {
    Object.values(this.providerForm.controls).forEach(control => control.enable());
  }

  isValidEmail(email: string | undefined): boolean {
    if (!email || typeof email != 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
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
      next: (res: any) => {
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
      await firstValueFrom(this.alertService.info('Formulario requerido', 'Por favor, complete el formulario antes de continuar.').afterClose);
    }

    if (this.hasSavedState()) {
      if (!this.user.rejected) {
        const confirmed = await this.alertService.confirm(
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
        if (!this.providerForm.get('repsEnableCode')?.value) {
          this.providerForm.patchValue({
            repsEnableCode: this.user.repsEnableCode,
          });
        }

        const user = this.user;
        user.rejected = res.rejected;
        this.authService.saveUserLogged(user);

        if (this.user.rejected && data.status === "Rechazado" && data.Reasons.length) {
          this.alertService.warning('Actualización requerida', `Motivo: ${data.Reasons[0].reason}`);
        }
      },
      error: (err: any) => {
        this.loading = false;
        console.error(err);
        this.messageService.create('error', 'Algo salió mal.');
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

  getGlobalIndex(localIndex: number, currentPage: number, pageSize: number): number {
    return (currentPage - 1) * pageSize + localIndex;
  }

  openOfficeModal(officeIndex: number | null = null) {
    const office = officeIndex != null
      ? this.existingOffices[officeIndex]
      : null;

    const modalRef = this.modalService.create<OfficeModalComponent, any>({
      nzTitle: office ? 'Actualizar sede de prestación de servicio' : 'Agregar sede de prestación de servicio',
      nzContent: OfficeModalComponent,
      nzCentered: true,
      nzClosable: true,
      nzMaskClosable: false,
      nzWidth: '900px',
      nzStyle: { 'max-width': '90%', 'margin': '22px 0' },
      nzOnCancel: () => {
        const componentInstance = modalRef.getContentComponent();
        if (componentInstance.hasChanges) {
          this.alertService.confirm(
            'Cambios sin guardar',
            'Tienes cambios en la sede. Si sales sin guardar, se perderán.',
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
    if (office) {
      instanceModal.office = office;
    }
    instanceModal.providerCompanies = this.providerCompanies;

    modalRef.afterClose.subscribe((result: any) => {
      if (result && result.office) {
        const newOffice = result.office;

        if (result.isNew && newOffice.value.idAddedTemporal) {
          if (officeIndex != null) {
            const createdOfficesIndex = this.createdOffices.controls.findIndex(
              (control) => control.value.idAddedTemporal === newOffice.value.idAddedTemporal
            );
            (this.createdOffices as FormArray).setControl(createdOfficesIndex, newOffice);
            this.existingOffices[officeIndex] = newOffice.value;
          } else {
            this.createdOffices.push(newOffice);
            this.existingOffices.push(newOffice.value);
          }
          this.existingOffices = [...this.existingOffices];
          this.messageService.create(
            'info',
            `Sede por ${officeIndex != null ? 'actualizar' : 'agregar'}.`
          );
        } else if (!result.isNew && officeIndex != null) {
          const updatedOfficesIndex = this.updatedOffices.controls.findIndex(
            (control) => control.value.idTemporalOfficeProvider === newOffice.value.idTemporalOfficeProvider
          );
          if (updatedOfficesIndex !== -1) {
            (this.updatedOffices as FormArray).setControl(updatedOfficesIndex, newOffice);
          } else {
            this.updatedOffices.push(newOffice);
          }
          this.existingOffices[officeIndex] = newOffice.value;
          this.existingOffices = [...this.existingOffices];
          this.messageService.create('info', 'Sede por actualizar.');
        }
      }
    });
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
          this.alertService.confirm(
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
          this.messageService.create(
            'info',
            `Contacto por ${contactIndex != null ? 'actualizar' : 'agregar'}.`
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
          this.messageService.create('info', 'Contacto por actualizar.');
        }
      }
    });
  }

  async deleteOffice(index: number) {
    const confirmed = await this.alertService.confirmDelete(
      '¿Eliminar sede?',
      'Eliminar sede de prestación de servicio del listado'
    );
    if (!confirmed) return;

    const deletedOffice = this.existingOffices[index];

    // Remove from existingOffices
    this.existingOffices.splice(index, 1);

    if (deletedOffice.idTemporalOfficeProvider !== null) {
      // Search in updatedOffices and delete if it exists
      const updatedIndex = this.updatedOffices.controls.findIndex(office =>
        office.value.idTemporalOfficeProvider == deletedOffice.idTemporalOfficeProvider
      );
      if (updatedIndex !== -1) {
        this.updatedOffices.removeAt(updatedIndex);
      }
      // Push to deleted array if it already existed
      this.deletedOffices.push(this.fb.control(deletedOffice.idTemporalOfficeProvider));
    } else {
      // Search in createdOffices and delete if it exists
      const createdIndex = this.createdOffices.controls.findIndex(office =>
        JSON.stringify(office.value) === JSON.stringify(deletedOffice)
      );
      if (createdIndex !== -1) {
        this.createdOffices.removeAt(createdIndex);
      }
    }
    this.existingOffices = [...this.existingOffices];
    this.messageService.create('info', 'Sede por eliminar.');
  }

  async deleteContact(index: number) {
    const confirmed = await this.alertService.confirmDelete(
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
    this.messageService.create('info', 'Contacto por eliminar.');
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
    this.messageService.remove();
    this.backendError = null;

    // Validate the existence of offices and contacts
    if (!this.existingOffices?.length) {
      this.alertService.warning('Aviso', 'Debe agregar al menos una sede de prestación de servicio.');
      return;
    }
    if (!this.existingContacts?.length) {
      this.alertService.warning('Aviso', 'Debe agregar al menos un contacto.');
      return;
    }

    // Validate incomplete information
    const hasInvalidOffice = this.existingOffices.some(office =>
      (!office.TemporalAddress && !office.address) ||
      (!office.TemporalSchedules?.length && !office.createdSchedules?.length)
    );
    if (hasInvalidOffice) {
      this.alertService.warning('Aviso', 'Algunas sedes tienen información incompleta.');
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

      this.alertService.warning(
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
          this.alertService.success('Enviado', 'Actualización enviada.');
          this.resetForm();
        },
        error: (err: any) => {
          this.loading = false;
          if (err.status == 422) this.backendError = err.error;
          console.error(err);
          this.alertService.error();
        }
      });
    }, 550);
  }

}
