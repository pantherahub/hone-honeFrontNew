import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { CitiesServiceService } from 'src/app/services/cities/cities-service.service';
import { ContactFormComponent } from '../contact-form/contact-form.component';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';
import { ContactsProviderServicesService } from 'src/app/services/contacts-provider/contacts-provider.services.service';
import { ClientProviderService } from 'src/app/services/clients/client-provider.service';
import { ClientInterface } from 'src/app/models/client.interface';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';

@Component({
  selector: 'app-office-modal',
  standalone: true,
  imports: [NgZorroModule, CommonModule],
  templateUrl: './office-modal.component.html',
  styleUrl: './office-modal.component.scss'
})
export class OfficeModalComponent implements OnInit {

  @Input() office: any | null = null;
  officeForm!: FormGroup;
  cities: any[] = [];
  clientList: ClientInterface[] = [];
  existingContacts: any[] = [];

  user = this.eventManager.userLogged();

  constructor(
    private eventManager: EventManagerService,
    private modal: NzModalRef,
    private fb: FormBuilder,
    private formUtils: FormUtilsService,
    private modalService: NzModalService,
    private citiesService: CitiesServiceService,
    private clientService: ClientProviderService,
    private contactsProviderService: ContactsProviderServicesService
  ) { }

  ngOnInit(): void {
    this.getCities();
    this.getClientList();
    this.initializeForm();
  }

  getCities() {
    this.citiesService.getCities().subscribe({
      next: (data: any) => {
        this.cities = data;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  getClientList() {
    this.clientService.getClientListByProviderId(this.user.id).subscribe({
      next: (res: any) => {
        this.clientList = res;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
 }

  loadContacts(officeId: number) {
    // Update endpoint and filter by office
    this.contactsProviderService.getContactById(officeId).subscribe({
      next: (res: any) => {
        this.existingContacts = res.contacts;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  initializeForm() {
    this.officeForm = this.fb.group({
      idTemporalOfficeProvider: [this.office?.idTemporalOfficeProvider || null],
      address: [this.office?.address || '', [Validators.required]],
      enableCode: [this.office?.enableCode || '', [Validators.required]],
      name: [this.office?.name || '', [Validators.required]],
      idCity: [this.office?.idCity || '', [Validators.required]],
      schedulingLink: [this.office?.schedulingLink || ''],

      attentionDays: [this.office?.attentionDays || '', [Validators.required]],
      officeHours: [this.office?.officeHours || '', [Validators.required]],
      idsClientHoneSolutions : [this.office?.idsClientHoneSolutions  || [], [Validators.required]],

      updatedContacts: this.fb.array([]),
      createdContacts: this.fb.array([]),
      deletedContacts: this.fb.array([])
    });
    if (this.office) {
      this.loadContacts(this.office.idTemporalOfficeProvider);
      // this.existingContacts = this.office.contacts || [];
    }
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
      instanceModal.contactModelType = 'office';
    }

    modalRef.afterClose.subscribe((result: any) => {
      if (result && result.contact) {
        const newContact = result.contact;

        if (result.isNew) {
          this.createdContacts.push(this.fb.group(newContact));
          this.existingContacts.push(newContact);
        } else if (!result.isNew && contactIndex != null) {
          const updatedContact = {
            ...newContact,
            cityName: newContact.occupationName || this.existingContacts[contactIndex].occupationName
          };
          this.updatedContacts.push(this.fb.group(updatedContact));
          this.existingContacts[contactIndex] = updatedContact;
        }
      }
    });
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

  onSubmit() {
    if (this.officeForm.invalid) {
      this.formUtils.markFormTouched(this.officeForm);
      return;
    }

    // Get selected city with name
    const selectedCity = this.cities.find(city => city.idCity === this.officeForm.value.idCity);
    const officeData = {
      ...this.officeForm.value,
      cityName: selectedCity ? selectedCity.city : null
    };

    this.modal.close({
      office: officeData,
      isNew: this.office === null
    });
  }
}
