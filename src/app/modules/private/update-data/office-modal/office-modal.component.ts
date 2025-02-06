import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { CitiesService } from 'src/app/services/cities/cities.service';
import { ContactFormComponent } from '../contact-form/contact-form.component';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';
import { ContactsProviderServicesService } from 'src/app/services/contacts-provider/contacts-provider.services.service';
import { ClientProviderService } from 'src/app/services/clients/client-provider.service';
import { CompanyInterface } from 'src/app/models/client.interface';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
import { distinctUntilChanged } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AlertService } from 'src/app/services/alerts/alert.service';

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
  companyList: CompanyInterface[] = [];
  existingContacts: any[] = [];

  user = this.eventManager.userLogged();
  modelType: string = 'Sede';

  constructor(
    private eventManager: EventManagerService,
    private modal: NzModalRef,
    private fb: FormBuilder,
    private formUtils: FormUtilsService,
    private messageService: NzMessageService,
    private alertService: AlertService,
    private modalService: NzModalService,
    private citiesService: CitiesService,
    private clientService: ClientProviderService,
    private contactsProviderService: ContactsProviderServicesService
  ) { }

  ngOnInit(): void {
    this.getCities();
    this.getCompanyList();
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

  getCompanyList() {
    this.clientService.getCompanies().subscribe({
      next: (res: any) => {
        this.companyList = res.data;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  /**
   * Update existingContacts with the modifications made.
   */
  refreshContacts(contacts: any[]) {
    // Convertir los contactos existentes en un Map para acceso rápido por idTemporalContact
    let existingContactsMap = new Map(
      contacts.map((contact: any) => [contact.idTemporalContact, contact])
    );

    const updatedContacts = this.office.updatedContacts || [];
    const createdContacts = this.office.createdContacts || [];
    const deletedContacts = this.office.deletedContacts || [];

    // 1. Actualizar solo los contactos existentes
    updatedContacts.forEach((contact: any) => {
      if (existingContactsMap.has(contact.idTemporalContact)) {
        existingContactsMap.set(contact.idTemporalContact, contact);
      }
    });

    // 2. Eliminar los contactos presentes en deletedContacts
    deletedContacts.forEach((id: number) => existingContactsMap.delete(id));

    // Convertir Map a array
    this.existingContacts = Array.from(existingContactsMap.values());

    // 3. Agregar los contactos nuevos (sin idTemporalContact) con push
    this.existingContacts.push(...createdContacts);
  }

  loadContacts() {
    const officeId = this.office.idTemporalOfficeProvider;
    if (!officeId) {
      this.refreshContacts(this.existingContacts);
      return;
    }

    this.contactsProviderService.getTemporalContactsById(this.modelType, officeId).subscribe({
      next: (res: any) => {
        this.refreshContacts(res.contacts);
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  initializeForm() {
    this.officeForm = this.fb.group({
      idTemporalOfficeProvider: [this.office?.idTemporalOfficeProvider || null],
      idAddedTemporal: [this.office?.idTemporalOfficeProvider ? null : this.office?.idAddedTemporal ?? Date.now().toString()],
      address: [this.office?.address || '', [Validators.required]],
      enableCode: [this.office?.enableCode || '', [Validators.required]],
      name: [this.office?.name || '', [Validators.required]],
      idCity: [this.office?.idCity || '', [Validators.required]],
      cityName: [this.office?.cityName || this.office?.City?.city || ''],
      schedulingLink: [this.office?.schedulingLink || ''],

      attentionDays: [this.office?.attentionDays || '', [Validators.required]],
      officeHours: [this.office?.officeHours || '', [Validators.required]],
      idsCompanies : [this.office?.idsCompanies || [], [Validators.required]],

      updatedContacts: this.fb.array([]),
      createdContacts: this.fb.array([]),
      deletedContacts: this.fb.array([])
    });

    if (this.office) {
      this.loadContacts();
      // this.existingContacts = this.office.contacts || [];
    }

    this.officeForm.get('idCity')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((value) => {
        // Get selected city with name and set cityName
        const selectedCity = this.cities.find(city => city.idCity === value);
        this.officeForm.patchValue({
          cityName: selectedCity ? selectedCity.city : ''
        });
      });
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
    instanceModal.contactModelType = this.modelType;
    if (contact) instanceModal.contact = contact;

    modalRef.afterClose.subscribe((result: any) => {
      if (result && result.contact) {
        const newContact = result.contact;

        if (result.isNew && newContact.value.idAddedTemporal) {
          // Revisar cuando se actualiza un contacto que fue agregado anteriormente
          console.log("PUSHH");
          console.log(newContact);
          console.log("contactIndex:", contactIndex);
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
            'success',
            `Contacto ${contactIndex != null ? 'actualizado' : 'agregado'}.`
          );
          console.log(this.existingContacts);
          console.log(this.officeForm.value);
        } else if (!result.isNew && contactIndex != null) {
          const updatedContactsIndex = this.updatedContacts.controls.findIndex(
            (control) => control.value.idTemporalContact === newContact.value.idTemporalContact
          );
          if (updatedContactsIndex) {
            (this.updatedContacts as FormArray).setControl(updatedContactsIndex, newContact);
          } else {
            this.updatedContacts.push(newContact);
          }
          this.existingContacts[contactIndex] = newContact.value;
          this.existingContacts = [...this.existingContacts];
          this.messageService.create('success', 'Contacto actualizado.');
        }
      }
    });
  }

  async deleteContact(index: number) {
    const confirmed = await this.alertService.confirmDelete();
    if (!confirmed) return;

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
    this.existingContacts = [...this.existingContacts];
    this.messageService.create('success', 'Contacto eliminado.');
  }

  onSubmit() {
    if (this.officeForm.invalid) {
      this.formUtils.markFormTouched(this.officeForm);
      return;
    }

    this.modal.close({
      office: this.officeForm,
      isNew: this.office === null || this.office.idTemporalOfficeProvider === null
    });
  }
}
