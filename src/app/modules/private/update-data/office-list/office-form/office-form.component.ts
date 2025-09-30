import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CompanyInterface } from 'src/app/models/client.interface';
import { ShortcutContact } from 'src/app/models/shortcut-contact.interface';
import { AlertService } from 'src/app/services/alert/alert.service';
import { ContactsProviderService } from 'src/app/services/contacts-provider/contacts-provider.service';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';
import { AddressFormComponent } from './address-form/address-form.component';
import { ScheduleFormComponent } from './schedule-form/schedule-form.component';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ContactFormComponent } from '../../shared/contact-form/contact-form.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { TextInputComponent } from 'src/app/shared/components/text-input/text-input.component';
import { InputErrorComponent } from 'src/app/shared/components/input-error/input-error.component';
import { SelectComponent } from 'src/app/shared/components/select/select.component';
import { DropdownTriggerDirective } from 'src/app/directives/dropdown-trigger.directive';
import { CatalogService } from 'src/app/services/catalog/catalog.service';
import { ContactDetailComponent } from '../../shared/contact-detail/contact-detail.component';
import { OfficeDataService } from 'src/app/services/office-data/office-data.service';

@Component({
  selector: 'app-office-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, TextInputComponent, InputErrorComponent, SelectComponent, AddressFormComponent, ScheduleFormComponent, DropdownTriggerDirective, ContactFormComponent, ContactDetailComponent],
  templateUrl: './office-form.component.html',
  styleUrl: './office-form.component.scss'
})
export class OfficeFormComponent {

  @Input() isFirstForm: boolean = true;
  @Input() companyList: CompanyInterface[] = [];
  @Input() providerCompanies: any[] = [];
  @Input() office: any | null = null;
  @Output() onClose = new EventEmitter<any>();

  officeForm!: FormGroup;
  hasChanges = false;

  cities: any[] = [];

  existingSchedules: any[] = [];
  existingContacts: any[] = [];

  selectedScheduleIndex: number | null = null;
  selectedContactIndex: number | null = null;

  schedulePage: number = 1;
  schedulePageSize: number = 3;
  loadingSchedules: boolean = false;

  contactPage: number = 1;
  contactPageSize: number = 5;
  loadingContacts: boolean = false;

  user = this.eventManager.userLogged();
  modelType: string = 'Sede';

  shortcutContacts: ShortcutContact[] = [
    {
      label: 'agendamiento de citas',
      isContactRequired: false,
      shortcut: {
        idOccupationType: 1,
        idOccupation: 12
      }
    }
  ];

  customErrorMessagesMap: { [key: string]: any } = {
    enableCode: {
      invalidLength: (error: string) => error
    },
    enableStartDateCode: {
      enableDateRange_startDateRequired: 'Este campo es requerido porque tiene una fecha de vencimiento.'
    },
    enableEndDateCode: {
      enableDateRange_endDateRequired: 'Este campo es requerido porque tiene una fecha de expedición.',
      enableDateRange_invalidDateRange: 'La fecha de vencimiento no puede ser menor a la fecha de expedición.',
    },
  };

  @ViewChild('addressDrawer', { static: false }) addressDrawer!: AddressFormComponent;
  @ViewChild('scheduleDrawer', { static: false }) scheduleDrawer!: ScheduleFormComponent;
  @ViewChild('contactDrawer', { static: false }) contactDrawer!: ContactFormComponent;
  @ViewChild('contactDetailDrawer', { static: false }) contactDetailDrawer!: ContactDetailComponent;

  constructor(
    private eventManager: EventManagerService,
    private fb: FormBuilder,
    private formUtils: FormUtilsService,
    private alertService: AlertService,
    private contactsProviderService: ContactsProviderService,
    private toastService: ToastService,
    private catalogService: CatalogService,
    private officeDataService: OfficeDataService,
  ) { }

  ngOnInit(): void {
    this.getCities();

    this.initializeForm();
    this.detectFormChanges();
  }

  getCities() {
    this.catalogService.getCities().subscribe({
      next: (data: any) => {
        this.cities = data;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  async close(officeData?: any) {
    if (!officeData && this.hasChanges) {
      const confirmed = await firstValueFrom(
        this.alertService.confirm(
          'Cambios sin guardar',
          'Tienes cambios en la sede. Si sales sin guardar, se perderán.',
          {
            confirmBtnText: 'Salir',
            cancelBtnText: 'Cancelar',
          }
        )
      );
      if (!confirmed) return;
    }
    this.onFormClose(officeData);
  }

  onFormClose(officeData?: any) {
    this.onClose.emit(officeData);
  }

  loadSchedules() {
    const officeId = this.office.idTemporalOfficeProvider;
    if (!officeId) {
      this.existingSchedules = this.officeDataService.refreshSchedules(
        this.office, this.existingSchedules
      );
      return;
    }
    this.existingSchedules = this.officeDataService.refreshSchedules(
      this.office, this.office.TemporalSchedules || []
    );
  }

  loadContacts() {
    const officeId = this.office.idTemporalOfficeProvider;
    if (!officeId) {
      this.existingContacts = this.officeDataService.refreshContacts(
        this.office, this.existingContacts
      );
      return;
    }

    this.loadingContacts = true;
    this.contactsProviderService
      .getTemporalContactsById(this.modelType, officeId)
      .subscribe({
        next: (res: any) => {
          this.existingContacts = this.officeDataService.refreshContacts(
            this.office, res.data
          );
          this.loadingContacts = false;
        },
        error: (err: any) => {
          console.error(err);
          this.loadingContacts = false;
        }
      });
  }

  getIdsCompanies(): number[] {
    if (!this.office) {
      return [];
    } else if (this.office.idsCompanies) {
      return this.office.idsCompanies;
    } else if (this.office.Companies) {
      return this.office.Companies.map((company: any) => company.idCompany);
    }
    return [];
  }

  detectFormChanges() {
    this.officeForm.valueChanges.subscribe(() => {
      this.hasChanges = true;
    });
  }

  convertDate(date: string) {
    if (!date) return null;
    return date.split('T')[0];
  }

  initializeForm() {
    this.officeForm = this.fb.group(
      {
        idTemporalOfficeProvider: [
          this.office?.idTemporalOfficeProvider || null
        ],
        idAddedTemporal: [
          this.office?.idTemporalOfficeProvider
            ? null
            : this.office?.idAddedTemporal ?? Date.now().toString()
        ],
        idCity: [this.office?.idCity || '', [Validators.required]],
        address: [this.office?.address || null, [Validators.required]],
        name: [this.office?.name || '', [Validators.required]],
        cityName: [this.office?.cityName || this.office?.City?.city || ''],
        schedulingLink: [
          this.office?.schedulingLink || '',
          [this.formUtils.url]
        ],
        emailGlosas: [this.office?.emailGlosas || '', [this.formUtils.email]],

        enableCode: [
          this.office?.enableCode || '',
          [this.formUtils.numeric, this.enableCodeValidator]
        ],
        enableStartDateCode: [
          this.convertDate(this.office?.enableStartDateCode) || null
        ],
        enableEndDateCode: [
          this.convertDate(this.office?.enableEndDateCode) || null
        ],

        idsCompanies: [this.getIdsCompanies(), [Validators.required]],

        updatedSchedules: this.fb.array(this.office?.updatedSchedules ?? []),
        createdSchedules: this.fb.array(this.office?.createdSchedules ?? []),
        deletedSchedules: this.fb.array(this.office?.deletedSchedules ?? []),

        updatedContacts: this.fb.array(this.office?.updatedContacts ?? []),
        createdContacts: this.fb.array(this.office?.createdContacts ?? []),
        deletedContacts: this.fb.array(this.office?.deletedContacts ?? []),

        TemporalSchedules: [this.office?.TemporalSchedules] // Save schedules state
      },
      {
        validators: [
          this.formUtils.validateDateRange(
            'enableStartDateCode',
            'enableEndDateCode',
            'enableDateRange',
            true
          )
        ]
      }
    );

    if (this.office) {
      this.loadSchedules();
      this.loadContacts();
      // this.existingContacts = this.office.contacts || [];
    }

    let previousCityId = this.office?.idCity || null;
    this.officeForm.get('idCity')?.valueChanges.subscribe(async newIdCity => {
      if (newIdCity === previousCityId) return;
      else if (!previousCityId) {
        this.updateCity(newIdCity);
        previousCityId = newIdCity;
        return;
      }

      const hasContacts = this.existingContacts && this.existingContacts.length;
      if (hasContacts) {
        const confirmed = await firstValueFrom(
          this.alertService.confirmDelete(
            '¿Está seguro?',
            'Si actualiza la ciudad todos los indicativos de teléfonos fijos de los contactos serán actualizados a la ciudad seleccionada.'
          )
        );
        if (!confirmed) {
          this.officeForm.patchValue(
            { idCity: previousCityId },
            { emitEvent: false }
          );
          return;
        }
        this.updateContactsByCity(newIdCity);
      }

      this.updateCity(newIdCity);
      previousCityId = newIdCity;
    });

    this.officeForm.get('enableCode')?.valueChanges.subscribe(value => {
      if (!value) {
        this.officeForm.patchValue({
          enableStartDateCode: null,
          enableEndDateCode: null
        });
        this.officeForm.get('enableStartDateCode')?.setErrors(null);
        this.officeForm.get('enableEndDateCode')?.setErrors(null);
      }
    });
  }

  get enableCode() {
    return this.officeForm.get('enableCode')?.value;
  }

  enableCodeValidator(control: AbstractControl) {
    if (!control || !control.value) return null;
    const length = control.value.length;
    if (length < 9 || length > 12) {
      return { invalidLength: 'Debe tener entre 9 y 12 dígitos.' };
    }
    return null;
  }

  updateCity(newIdCity: number) {
    // Adds the idCity to the address object if it is already filled in
    const address = this.officeForm.get('address');
    if (address?.value) {
      address.patchValue({
        ...address?.value,
        idCity: newIdCity
      });
    }

    // Get selected city with name and set cityName
    const selectedCity = this.cities.find(city => city.idCity === newIdCity);
    this.officeForm.patchValue({
      cityName: selectedCity ? selectedCity.city : ''
    });
  }

  updateContactsByCity(newCityId: number) {
    const updatePhoneArrays = (phones: any[]) => {
      return phones.map((phone: any) => {
        if (phone.type === 'Fijo') {
          const updatedPhone = {
            ...phone,
            idCity: newCityId
          };
          return updatedPhone;
        }
        return { ...phone };
      });
    };

    const updateCityForPhones = (
      contacts: any[],
      isContactBaseList: boolean = false
    ) => {
      return contacts.map(contact => {
        // Modify only "Fijo" type phones
        const hasFijoPhone = contact.Phones?.some(
          (phone: any) => phone.type === 'Fijo'
        );
        if (!hasFijoPhone) return contact;

        contact.Phones = contact.Phones.map((phone: any) => {
          if (phone.type === 'Fijo') {
            const updatedPhone = {
              ...phone,
              idCity: newCityId,
              status: phone.status == null ? 'updated' : phone.status
            };
            if (phone.status == null) {
              if (!contact.updatedPhones) {
                contact.updatedPhones = [];
              }
              contact.updatedPhones.push({ ...updatedPhone });
            }
            return updatedPhone;
          }
          return phone;
        });
        contact.createdPhones = updatePhoneArrays(contact.createdPhones || []);
        contact.updatedPhones = updatePhoneArrays(contact.updatedPhones || []);

        if (isContactBaseList && contact.idTemporalContact) {
          const alreadyUpdated = this.updatedContacts.controls.some(
            control =>
              control.value.idTemporalContact === contact.idTemporalContact
          );
          if (!alreadyUpdated) {
            // Add contact to updatedContacts FormArray
            this.updatedContacts.push(this.fb.nonNullable.control(contact));
          }
        }

        return { ...contact };
      });
    };

    // Update contacts in each list
    this.existingContacts = updateCityForPhones(this.existingContacts, true);
    this.createdContacts.setValue(
      updateCityForPhones(this.createdContacts.value || [])
    );
    this.updatedContacts.setValue(
      updateCityForPhones(this.updatedContacts.value || [])
    );
  }

  get updatedSchedules() {
    return this.officeForm.get('updatedSchedules') as FormArray;
  }
  get createdSchedules() {
    return this.officeForm.get('createdSchedules') as FormArray;
  }
  get deletedSchedules() {
    return this.officeForm.get('deletedSchedules') as FormArray;
  }

  get updatedContacts() {
    return this.officeForm.get('updatedContacts') as FormArray;
  }
  get createdContacts() {
    return this.officeForm.get('createdContacts') as FormArray;
  }
  get deletedContacts() {
    return this.officeForm.get('deletedContacts') as FormArray;
  }

  // Missing shortcut contacts
  getMissingContacts(filterRequiredOnly: boolean = false): ShortcutContact[] {
    return this.shortcutContacts.filter(contact => {
      const saved = this.existingContacts.some(
        c => c.idOccupation === contact.shortcut.idOccupation
      );
      return !saved && (!filterRequiredOnly || contact.isContactRequired);
    });
  }

  get citasContactMissing(): ShortcutContact | undefined {
    return this.getMissingContacts().find(c => c.shortcut.idOccupation === 12);
  }

  openContactShortcut(shortcutContact: ShortcutContact) {
    this.openContactForm(null, shortcutContact);
  }

  successToast(message: string) {
    this.toastService.success(message, { color: 'info' });
  }

  openAddressModal() {
    this.addressDrawer.open();
  }

  onAddressDrawerClose(result: any) {
    const addressControl = this.officeForm.get('address');
    addressControl?.markAsTouched();
    if (result && result.address) {
      const newAddress = result.address;
      const idCity = this.officeForm.get('idCity')?.value;
      this.officeForm.patchValue({ address: { ...newAddress, idCity } });
    }
  }

  getGlobalIndex(page: number, pageSize: number, localIndex: number): number {
    return (page - 1) * pageSize + localIndex;
  }

  openScheduleForm(index: number | null = null) {
    this.selectedScheduleIndex = index;
    const schedule = this.selectedScheduleIndex != null
      ? this.existingSchedules[this.selectedScheduleIndex]
      : null;
    this.scheduleDrawer.open({
      schedule,
      existingSchedules: this.existingSchedules,
    });
  }

  onScheduleDrawerClose(result: any) {
    if (result) {
      this.handleSaveSchedule(result);
    }
    this.selectedScheduleIndex = null;
  }

  private handleSaveSchedule(result: any) {
    const scheduleIndex = this.selectedScheduleIndex;

    if (result && result.schedule) {
      const newSchedule = result.schedule;

      if (result.isNew && newSchedule.value.idAddedTemporal) {
        if (scheduleIndex != null) {
          const createdSchedulesIndex = this.createdSchedules.controls.findIndex(
            control =>
              control.value.idAddedTemporal ===
              newSchedule.value.idAddedTemporal
          );
          (this.createdSchedules as FormArray).setControl(
            createdSchedulesIndex,
            newSchedule
          );
          this.existingSchedules[scheduleIndex] = newSchedule.value;
        } else {
          this.createdSchedules.push(newSchedule);
          this.existingSchedules.push(newSchedule.value);
        }
        this.existingSchedules = [...this.existingSchedules];
        this.successToast(`Horario por ${scheduleIndex != null ? 'actualizar' : 'agregar'}.`);
      } else if (!result.isNew && scheduleIndex != null) {
        const updatedSchedulesIndex = this.updatedSchedules.controls.findIndex(
          control =>
            control.value.idTemporalSchedule ===
            newSchedule.value.idTemporalSchedule
        );
        if (updatedSchedulesIndex !== -1) {
          (this.updatedSchedules as FormArray).setControl(
            updatedSchedulesIndex,
            newSchedule
          );
        } else {
          this.updatedSchedules.push(newSchedule);
        }
        this.existingSchedules[scheduleIndex] = newSchedule.value;
        this.existingSchedules = [...this.existingSchedules];
        this.successToast('Horario por actualizar.');
      }
    }
  }

  async deleteSchedule(index: number) {
    const confirmed = await firstValueFrom(
      this.alertService.confirmDelete(
        '¿Eliminar horario?',
        'Eliminar horario de atención del listado'
      )
    );
    if (!confirmed) return;

    const deletedSchedule = this.existingSchedules[index];

    // Remove from existingSchedules
    this.existingSchedules.splice(index, 1);

    if (deletedSchedule.idTemporalSchedule !== null) {
      // Search in updatedSchedules and delete if it exists
      const updatedIndex = this.updatedSchedules.controls.findIndex(
        schedule =>
          schedule.value.idTemporalSchedule ==
          deletedSchedule.idTemporalSchedule
      );
      if (updatedIndex !== -1) {
        this.updatedSchedules.removeAt(updatedIndex);
      }
      // Push to deleted array if it already existed
      this.deletedSchedules.push(
        this.fb.control(deletedSchedule.idTemporalSchedule)
      );
    } else {
      // Search in createdSchedules and delete if it exists
      const createdIndex = this.createdSchedules.controls.findIndex(
        schedule =>
          JSON.stringify(schedule.value) === JSON.stringify(deletedSchedule)
      );
      if (createdIndex !== -1) {
        this.createdSchedules.removeAt(createdIndex);
      }
    }
    this.existingSchedules = [...this.existingSchedules];
    this.successToast('Horario por eliminar.');
  }

  viewContact(contactIndex: number | null = null) {
    if (contactIndex == null) return;
    const contact = this.existingContacts[contactIndex];
    this.contactDetailDrawer.open(contact);
  }

  openContactForm(
    contactIndex: number | null = null,
    contactShortcut: ShortcutContact | null = null
  ) {
    this.formUtils.trimFormStrControls(this.officeForm);
    if (this.officeForm.invalid) {
      this.formUtils.markFormTouched(this.officeForm);
      this.alertService.warning(
        '¡Acción requerida!',
        'Debes diligenciar la información de la sede antes de agregar los datos de contacto.'
      );
      return;
    }

    this.selectedContactIndex = contactIndex;
    const contact = this.selectedContactIndex != null
      ? this.existingContacts[this.selectedContactIndex]
      : null;
    this.contactDrawer.open({
      contact,
      officeIdCity: this.officeForm.value.idCity,
      shortcut: contactShortcut ? contactShortcut.shortcut : null,
    });
  }

  onContactDrawerClose(result: any) {
    if (result) {
      this.handleSaveContact(result);
    }
    this.selectedContactIndex = null;
  }

  private handleSaveContact(result: any) {
    const contactIndex = this.selectedContactIndex;

    if (result && result.contact) {
      const newContact = result.contact;

      if (result.isNew && newContact.value.idAddedTemporal) {
        if (contactIndex != null) {
          const createdContactsIndex = this.createdContacts.controls.findIndex(
            control =>
              control.value.idAddedTemporal ===
              newContact.value.idAddedTemporal
          );
          (this.createdContacts as FormArray).setControl(
            createdContactsIndex,
            newContact
          );
          this.existingContacts[contactIndex] = newContact.value;
        } else {
          this.createdContacts.push(newContact);
          this.existingContacts.push(newContact.value);
        }
        this.existingContacts = [...this.existingContacts];
        this.successToast(`Contacto por ${contactIndex != null ? 'actualizar' : 'agregar'}.`);
      } else if (!result.isNew && contactIndex != null) {
        const updatedContactsIndex = this.updatedContacts.controls.findIndex(
          control =>
            control.value.idTemporalContact ===
            newContact.value.idTemporalContact
        );
        if (updatedContactsIndex !== -1) {
          (this.updatedContacts as FormArray).setControl(
            updatedContactsIndex,
            newContact
          );
        } else {
          this.updatedContacts.push(newContact);
        }
        this.existingContacts[contactIndex] = newContact.value;
        this.existingContacts = [...this.existingContacts];
        this.successToast('Contacto por actualizar.');
      }
    }
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
      const updatedIndex = this.updatedContacts.controls.findIndex(
        contact =>
          contact.value.idTemporalContact == deletedContact.idTemporalContact
      );
      if (updatedIndex !== -1) {
        this.updatedContacts.removeAt(updatedIndex);
      }
      // Push to deleted array if it already existed
      this.deletedContacts.push(
        this.fb.control(deletedContact.idTemporalContact)
      );
    } else {
      // Search in createdContacts and delete if it exists
      const createdIndex = this.createdContacts.controls.findIndex(
        contact =>
          JSON.stringify(contact.value) === JSON.stringify(deletedContact)
      );
      if (createdIndex !== -1) {
        this.createdContacts.removeAt(createdIndex);
      }
    }
    this.existingContacts = [...this.existingContacts];
    this.successToast('Contacto por eliminar.');
  }

  onSubmit() {
    this.formUtils.trimFormStrControls(this.officeForm);
    this.formUtils.markFormTouched(this.officeForm, true);
    if (this.officeForm.invalid) return;

    if (!this.existingSchedules?.length) {
      this.alertService.warning(
        '¡Acción requerida!',
        'Debes agregar al menos un horario de atención.'
      );
      return;
    }
    if (!this.existingContacts?.length) {
      this.alertService.warning(
        '¡Acción requerida!',
        'Debes agregar al menos un contacto.'
      );
      return;
    }
    if (this.getMissingContacts(true).length > 0) {
      this.alertService.warning(
        '¡Acción requerida!',
        'Faltan algunos contactos requeridos. Por favor diligéncialos.'
      );
      return;
    }

    const selectedCompanyIds: number[] =
      this.officeForm.get('idsCompanies')?.value || [];
    const providerCompanyIds: number[] = this.providerCompanies.map(
      (c: any) => c.idCompany
    );
    const companiesIds = Array.from(
      new Set([...selectedCompanyIds, ...providerCompanyIds])
    );

    const schedulingLink =
      this.officeForm.get('schedulingLink')?.value?.toLowerCase() || null;
    const emailGlosas =
      this.officeForm.get('emailGlosas')?.value?.toLowerCase() || null;
    const enableCode =
      this.officeForm.get('enableCode')?.value?.toLowerCase() || null;

    this.officeForm.patchValue({
      schedulingLink: schedulingLink,
      emailGlosas: emailGlosas,
      enableCode: enableCode,
      idsCompanies: companiesIds
    });

    this.close({
      office: this.officeForm,
      isNew:
        this.office === null || this.office.idTemporalOfficeProvider === null
    });
  }

}
