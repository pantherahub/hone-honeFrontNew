import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
import { OfficeModalComponent } from './office-modal/office-modal.component';
import { OfficeProviderService } from 'src/app/services/office-provider/office-provider.service';
import { ContactsProviderServicesService } from 'src/app/services/contacts-provider/contacts-provider.services.service';
import { ClientProviderService } from 'src/app/services/clients/client-provider.service';
import { LANGUAGES } from 'src/app/utils/languages';
import { ContactFormComponent } from './contact-form/contact-form.component';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';

@Component({
  selector: 'app-update-data',
  standalone: true,
  imports: [NgZorroModule, CommonModule],
  templateUrl: './update-data.component.html',
  styleUrl: './update-data.component.scss'
})
export class UpdateDataComponent implements OnInit {

  user = this.eventManager.userLogged();
  providerForm!: FormGroup;

  languages: any[] = LANGUAGES;
  identificationTypes: any[] = [];

  existingOffices: any[] = [];
  existingContacts: any[] = [];

  constructor (
    // private clientService: ClientProviderService,
    private eventManager: EventManagerService,
    private fb: FormBuilder,
    private formUtils: FormUtilsService,
    private modalService: NzModalService,
    private officeProviderService: OfficeProviderService,
    private contactsProviderService: ContactsProviderServicesService,
    private clientProviderService: ClientProviderService
    // private router: Router
  ) { }

  ngOnInit(): void {
    this.providerForm = this.fb.group({});
    this.getIdentificationTypes();

    this.initializeForm();
    // this.loadProviderData();

    // Remove (testing):
    this.loadContacts(this.user.id || 0);
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

  loadOffices(providerId: number) {
    this.officeProviderService.getOfficeProviders(providerId, this.user.roles?.idRoles).subscribe({
      next: (res: any) => {
        this.existingOffices = res.data[0];
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  loadContacts(providerId: number) {
    // Update endpoint and filter by provider
    this.contactsProviderService.getContactById(providerId).subscribe({
      next: (res: any) => {
        this.existingContacts = res.contacts;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  initializeForm() {
    this.providerForm = this.fb.group({
      idProvider: [this.user.id],
      startTime: [new Date().toString()],
      endTime: [''],
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required]],
      languages: [[], [Validators.required]],
      razonSocial: ['', [Validators.required]],
      idTypeDocument: ['', [Validators.required]],
      identification: ['', [Validators.required]],
      website: [''],

      updatedOffices: this.fb.array([]),
      createdOffices: this.fb.array([]),
      deletedOffices: this.fb.array([]),

      updatedContacts: this.fb.array([]),
      createdContacts: this.fb.array([]),
      deletedContacts: this.fb.array([])
    });
  }

  loadProviderData(): void {
    this.clientProviderService.getProviderData(this.user.id).subscribe({
      next: (res: any) => {
        const data = res.data;
        this.providerForm.patchValue({
          email: data.email,
          name: data.name,
          languages: data.languages,
          razonSocial: data.razonSocial,
          idTypeDocument: data.idTypeDocument,
          identification: data.identification,
          website: data.website
        });

        this.loadOffices(data.idProvider);
        this.loadContacts(data.idProvider);
      },
      error: (err: any) => {
        console.error(err);
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

  openOfficeModal(officeIndex: number | null = null) {
    const office = officeIndex
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

    // modal.afterOpen.subscribe(() => {});
    modalRef.afterClose.subscribe((result: any) => {
      if (result && result.office) {
        const newOffice = result.office;

        if (result.isNew) {
          console.log("result.office");
          console.log(result.office);
          console.log(newOffice);
          this.createdOffices.push(newOffice);
          this.existingOffices.push(newOffice.value);
          this.existingOffices = [...this.existingOffices];
          console.log("form");
          console.log(this.providerForm.value);
        } else if (!result.isNew && officeIndex != null) {
          // const updatedOffice = {
          //   ...newOffice,
          //   cityName: newOffice.cityName || this.existingOffices[officeIndex].cityName
          // };
          this.updatedOffices.push(newOffice);
          this.existingOffices[officeIndex] = newOffice.value;
          this.existingOffices = [...this.existingOffices];
        }
      }
    });
  }

  openContactModal(contactIndex: number | null = null) {
    const contact = contactIndex
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
    if (contact) {
      instanceModal.contact = contact;
      instanceModal.contactModelType = 'provider';
    }

    modalRef.afterClose.subscribe((result: any) => {
      if (result && result.contact) {
        const newContact = result.contact;

        if (result.isNew) {
          this.createdContacts.push(this.fb.group(newContact));
          this.existingContacts.push(newContact);
          this.existingContacts = [...this.existingContacts];
        } else if (!result.isNew && contactIndex != null) {
          const updatedContact = {
            ...newContact,
            cityName: newContact.occupationName || this.existingContacts[contactIndex].occupationName
          };
          this.updatedContacts.push(this.fb.group(updatedContact));
          this.existingContacts[contactIndex] = updatedContact;
          this.existingContacts = [...this.existingContacts];
        }
      }
    });
  }

  deleteOffice(index: number): void {
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

  }

  deleteContact(index: number): void {
    const deletedContact = this.existingContacts[index];

    // Remove from existingContacts
    this.existingContacts.splice(index, 1);

    if (deletedContact.idTemporalContact !== null) {
      // Search in updatedContacts and delete if it exists
      const updatedIndex = this.updatedContacts.controls.findIndex(office =>
        office.value.idTemporalContact == deletedContact.idTemporalContact
      );
      if (updatedIndex !== -1) {
        this.updatedContacts.removeAt(updatedIndex);
      }
      // Push to deleted array if it already existed
      this.deletedContacts.push(this.fb.control(deletedContact.idTemporalContact));
    } else {
      // Search in createdContacts and delete if it exists
      const createdIndex = this.createdContacts.controls.findIndex(office =>
        JSON.stringify(office.value) === JSON.stringify(deletedContact)
      );
      if (createdIndex !== -1) {
        this.createdContacts.removeAt(createdIndex);
      }
    }
  }

  onSubmit(): void {
    console.log("onSubmit");
    if (this.providerForm.invalid) {
      this.formUtils.markFormTouched(this.providerForm);
      return;
    };
    this.providerForm.patchValue({ endTime: new Date().toString() });
    console.log(this.providerForm.value);
  }

}
