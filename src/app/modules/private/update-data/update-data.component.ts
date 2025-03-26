import { CommonModule, Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-update-data',
  standalone: true,
  imports: [NgZorroModule, CommonModule, BackendErrorsComponent],
  templateUrl: './update-data.component.html',
  styleUrl: './update-data.component.scss'
})
export class UpdateDataComponent implements OnInit, OnDestroy {

  user = this.eventManager.userLogged();
  providerForm!: FormGroup;
  isFirstForm: boolean = true;

  languages: any[] = LANGUAGES;
  identificationTypes: any[] = [];

  existingOffices: any[] = [];
  existingContacts: any[] = [];

  officePage: number = 1;
  officePageSize: number = 5;

  contactPage: number = 1;
  contactPageSize: number = 5;

  loading: boolean = false;
  backendError: any = null;

  autoSaveInterval: any;
  private formSubscription: any;

  constructor (
    private eventManager: EventManagerService,
    private fb: FormBuilder,
    private formUtils: FormUtilsService,
    private messageService: NzMessageService,
    private alertService: AlertService,
    private modalService: NzModalService,
    private clientProviderService: ClientProviderService,
    private location: Location,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.providerForm = this.fb.group({});

    this.getIdentificationTypes();
    this.initializeForm();

    this.loadFormData();

  }

  ngOnDestroy(): void {
    this.unsubscribeForm();
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

  initializeForm() {
    this.providerForm = this.fb.group({
      idProvider: [this.user.id],
      startTime: [this.formatDate(new Date())],
      endTime: [''],
      email: [this.user.email || '', [Validators.required, this.formUtils.emailValidator]],
      name: [this.user.name || '', [Validators.required]],
      languages: [[], [Validators.required]],
      idTypeDocument: ['', [Validators.required]],
      identification: ['', [Validators.required, this.formUtils.numeric]],
      dv: [null, [this.dvValidator]],
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
    this.location.back();
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
      formValue: this.providerForm.value,
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
    this.providerForm.patchValue({
      startTime: formState.startTime,
      email: formState.email,
      name: formState.name,
      languages: formState.languages,
      idTypeDocument: formState.idTypeDocument,
      identification: formState.identification,
      dv: formState.dv,
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
          website: data.website
        });

        this.existingOffices = data.TemporalOffices;
        this.existingContacts = data.TemporalContactsForProvider;

        this.subscribeOnChange();

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
      nzTitle: office ? 'Actualizar sede' : 'Agregar sede',
      nzContent: OfficeModalComponent,
      nzCentered: true,
      nzClosable: true,
      nzWidth: '900px',
      nzStyle: { 'max-width': '90%', 'margin': '22px 0' }
    });
    const instanceModal = modalRef.getContentComponent();
    if (office) {
      instanceModal.office = office;
    }

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
      nzWidth: '600px',
      nzStyle: { 'max-width': '90%', 'margin': '22px 0' }
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
      'Eliminar sede del listado'
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

    this.providerForm.reset({
      idProvider: this.user.id,
      startTime: this.formatDate(new Date()),
      endTime: '',
      email: this.user.email || '',
      name: this.user.name || '',
      languages: [],
      idTypeDocument: '',
      identification: '',
      dv: null,
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

    if (!this.existingOffices?.length) {
      this.alertService.warning('Aviso', 'Debe agregar al menos una sede.');
      return;
    }
    if (!this.existingContacts?.length) {
      this.alertService.warning('Aviso', 'Debe agregar al menos un contacto.');
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
      serviceMethod(this.providerForm.value).subscribe({
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
