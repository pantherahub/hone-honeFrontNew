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

@Component({
  selector: 'app-update-data',
  standalone: true,
  imports: [NgZorroModule, CommonModule],
  templateUrl: './update-data.component.html',
  styleUrl: './update-data.component.scss'
})
export class UpdateDataComponent implements OnInit {

  user = this.eventManager.userLogged();
  startTime!: Date;
  // startTime2!: number;
  taskForm!: FormGroup;

  languages: any[] = LANGUAGES;
  identificationTypes: any[] = [];

  existingOffices: any[] = [];
  existingContacts: any[] = [];

  constructor (
    // private clientService: ClientProviderService,
    private eventManager: EventManagerService,
    private fb: FormBuilder,
    private modalService: NzModalService,
    private officeProviderService: OfficeProviderService,
    private contactsProviderService: ContactsProviderServicesService,
    private clientProviderService: ClientProviderService
    // private router: Router
  ) { }

  ngOnInit(): void {
    this.taskForm = this.fb.group({});
    this.getIdentificationTypes();
    this.getOffices();
    this.getContacts();

    this.initializeForm();


    this.startTime = new Date();
    console.log('Inicio del formulario Date:', this.startTime);
    // this.startTime2 = Date.now();
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

  getOffices() {
    this.officeProviderService.getOfficeProviders(this.user.id, this.user.roles?.idRoles).subscribe({
      next: (res: any) => {
        this.existingOffices = res.data[0];
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  getContacts() {
    this.contactsProviderService.getContactById(this.user.id).subscribe({
      next: (res: any) => {
        this.existingContacts = res.contacts;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  initializeForm() {
    this.taskForm = this.fb.group({
      startTime: [new Date()],
      endTime: [''],
      email: ['', [Validators.required]],
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
    }, {
      validators: [this.emailOrIdentificationGroupValidator]
    });
  }

  /**
   * Validator of the 'email' field validating email or identification
   */
  emailOrIdentificationGroupValidator(group: AbstractControl): ValidationErrors | null {
    const emailControl = group.get('email');
    const identificationControl = group.get('identification');
    if (!emailControl || !identificationControl) return null;

    const emailOrIdentification = emailControl.value;
    const identification = identificationControl.value;

    // Not required
    if (!emailOrIdentification) return null;

    // Validate if it is an email
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+(\.[a-zA-Z]{2,})+$/;
    if (emailPattern.test(emailOrIdentification)) return null;

    // Check if it matches the ID
    if (!identification || emailOrIdentification !== identification) {
      return { invalidEmailOrIdentification: true };
    }
    return null;
  }

  get updatedOffices() {
    return this.taskForm.get('updatedOffices') as FormArray;
  }
  get createdOffices() {
    return this.taskForm.get('createdOffices') as FormArray;
  }
  get deletedOffices() {
    return this.taskForm.get('deletedOffices') as FormArray;
  }

  get updatedContacts() {
    return this.taskForm.get('updatedContacts') as FormArray;
  }
  get createdContacts() {
    return this.taskForm.get('createdContacts') as FormArray;
  }
  get deletedContacts() {
    return this.taskForm.get('deletedContacts') as FormArray;
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
          this.createdOffices.push(this.fb.group(newOffice));
          this.existingOffices.push(newOffice);
        } else if (!result.isNew && officeIndex != null) {
          this.updatedOffices.push(this.fb.group(newOffice));
          this.existingOffices[officeIndex] = newOffice;
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
      if (result && result.office) {
        const newOffice = result.office;
        if (result.isNew) {
          this.createdContacts.push(this.fb.group(newOffice));
          this.existingContacts.push(newOffice);
        } else if (!result.isNew && contactIndex != null) {
          this.updatedContacts.push(this.fb.group(newOffice));
          this.existingContacts[contactIndex] = newOffice;
        }
      }
    });
  }

  deleteOffice(index: number): void {
    const deletedOffice = this.existingOffices[index];

    // Remuevo de existingOffices
    this.existingOffices.splice(index, 1);

    if (deletedOffice.idTemporalOfficeProvider !== null) {
      // Buscar en updatedOffices y eliminar si existe
      const updatedIndex = this.updatedOffices.controls.findIndex(office =>
        office.value.idTemporalOfficeProvider == deletedOffice.idTemporalOfficeProvider
      );
      if (updatedIndex !== -1) {
        this.updatedOffices.removeAt(updatedIndex);
      }
      // Hago push al array de eliminados si es una sede existente
      this.deletedOffices.push(this.fb.control(deletedOffice.idTemporalOfficeProvider));
    } else {
      // Buscar en createdOffices y eliminar si existe
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

    // Remuevo de existingContacts
    this.existingContacts.splice(index, 1);

    if (deletedContact.idTemporalContact !== null) {
      // Buscar en updatedContacts y eliminar si existe
      const updatedIndex = this.updatedContacts.controls.findIndex(office =>
        office.value.idTemporalContact == deletedContact.idTemporalContact
      );
      if (updatedIndex !== -1) {
        this.updatedContacts.removeAt(updatedIndex);
      }
      // Hago push al array de eliminados si es una sede existente
      this.deletedContacts.push(this.fb.control(deletedContact.idTemporalContact));
    } else {
      // Buscar en createdContacts y eliminar si existe
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
    if (this.taskForm.invalid) {
      // this.taskForm.markAllAsTouched();
      Object.values(this.taskForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
        if (control instanceof FormArray) {
          control.controls.forEach((group: AbstractControl) => {
            if (group instanceof FormGroup) {
              // Si es un FormGroup, recorro los controles
              Object.values(group.controls).forEach(field => {
                field.markAsTouched();
                field.updateValueAndValidity();
              });
            } else if (group instanceof FormControl) {
              // Si es un FormControl, valido directamente
              group.markAsTouched();
              group.updateValueAndValidity();
            }
          });
        } else {
          control.markAsTouched();
          control.updateValueAndValidity();
        }
      });
      return;
    };
    this.taskForm.patchValue({ endTime: new Date() });
  }

}
