import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
import { OfficeModalComponent } from './office-modal/office-modal.component';
import { OfficeProviderService } from 'src/app/services/office-provider/office-provider.service';
import { ContactsProviderServicesService } from 'src/app/services/contacts-provider/contacts-provider.services.service';
import { ClientProviderService } from 'src/app/services/clients/client-provider.service';

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
      language: ['', [Validators.required]],
      razonSocial: ['', [Validators.required]],
      documentTypeId: ['', [Validators.required]],
      identification: ['', [Validators.required]],

      updatedOffices: this.fb.array([]),
      createdOffices: this.fb.array([]),
      deletedOffices: this.fb.array([])
    }, {
      validators: [this.emailOrIdentificationGroupValidator]
    });
  }

  minArrayLength(min: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control && control.value && control.value.length < min) {
        return { 'minArrayLength': { valid: false } };
      }
      return null;
    };
  }

  maxArrayLength(max: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control && control.value && control.value.length > max) {
        return { 'maxArrayLength': { valid: false } };
      }
      return null;
    };
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

  addOffice(officeIndex: number, formOfficeArray: FormArray) {
    const office = this.existingOffices[officeIndex];
    const officeGroup = this.fb.group({
      emails: this.fb.array([
        this.fb.control('', [Validators.required, Validators.email])
      ], [this.minArrayLength(1), this.maxArrayLength(5)]),
      userAttentionAddress: ['', [Validators.required]],
      enableCode: ['', [Validators.required]],
      name: ['', [Validators.required]],
      cityId: ['', [Validators.required]],
      customerContactEmail: ['', [Validators.required, Validators.email]],
      customerContactTelephone: ['', [Validators.required]],
      tradeTelephone: ['', [Validators.required]],
      tradeEmail: ['', [Validators.required, Validators.email]],
      billTelephone: ['', [Validators.required]],
      billEmail: ['', [Validators.required, Validators.email]],
      attentionDays: ['', [Validators.required]],
      officeHours: ['', [Validators.required]],

      datingTelephone: ['', [Validators.required]],
      datingCell: ['', [Validators.required]],
      datingWhatsappLines: this.fb.array([
        this.fb.control('', [Validators.required])
      ], [this.minArrayLength(1)]),
      datingEmail: ['', [Validators.required, Validators.email]],

      nameLegalRepresentation: ['', [Validators.required]],
      identificationLegalRepresentation: ['', [Validators.required]],
      expeditionLocation: ['', [Validators.required]],
      expeditionDate: ['', [Validators.required]],
      telephoneLegalRepresentation: ['', [Validators.required]],
      emailLegalRepresentation: ['', [Validators.required, Validators.email]],

      managerName: ['', [Validators.required]],
      managerTelephone: ['', [Validators.required]],
      managerEmail: ['', [Validators.required, Validators.email]],

      administratorName: ['', [Validators.required]],
      administratorTelephone: ['', [Validators.required]],
      administratorEmail: ['', [Validators.required, Validators.email]],

      businessName: ['', [Validators.required]],
      businessTelephone: ['', [Validators.required]],
      businessEmail: ['', [Validators.required, Validators.email]],

      billingName: ['', [Validators.required]],
      billingTelephone: ['', [Validators.required]],
      billingEmail: ['', [Validators.required, Validators.email]],

      authorizationsName: ['', [Validators.required]],
      authorizationsTelephone: ['', [Validators.required]],
      authorizationsEmail: ['', [Validators.required, Validators.email]],
    });

    formOfficeArray.push(officeGroup);
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

  deleteOffice(index: number): void {
    const deletedOffice = this.existingOffices[index];

    // Remuevo de existingOffices
    this.existingOffices.splice(index, 1);

    if (deletedOffice.idOfficeProvider !== null) {
      // Buscar en updatedOffices y eliminar si existe
      const updatedIndex = this.updatedOffices.controls.findIndex(office =>
        office.value.idOfficeProvider == deletedOffice.idOfficeProvider
      );
      if (updatedIndex !== -1) {
        this.updatedOffices.removeAt(updatedIndex);
      }
      // Hago push al array de eliminados si es una sede existente
      this.deletedOffices.push(this.fb.control(deletedOffice.idOfficeProvider));
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

  // calcTime(): any {
  //   const endTime = new Date();
  //   console.log('Final del formulario:', endTime);

  //   const timeDifference = endTime.getTime() - this.startTime.getTime();
  //   // Convertir la diferencia a un formato legible (horas, minutos, segundos)
  //   const seconds = Math.floor((timeDifference / 1000) % 60);
  //   const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
  //   const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);

  //   const timeTaken = `${hours} horas, ${minutes} minutos, ${seconds} segundos`;
  //   console.log('Tiempo total tomado:', timeTaken);

  //   return timeTaken;
  // }

  onSubmit(): void {
    console.log("onSubmit");
    if (this.taskForm.invalid) {
      console.log("invalid");
      // this.taskForm.markAllAsTouched();
      Object.values(this.taskForm.controls).forEach(control => {
        // if (control.invalid) {
        //   control.markAsDirty();
        //   control.updateValueAndValidity({ onlySelf: true });
        // }
        if (control instanceof FormArray) {
          control.controls.forEach((group: AbstractControl) => {
            Object.values((group as FormGroup).controls).forEach(field => {
              field.markAsTouched();
              field.updateValueAndValidity();
            });
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
