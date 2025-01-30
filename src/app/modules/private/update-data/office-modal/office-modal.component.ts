import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { CitiesServiceService } from 'src/app/services/cities/cities-service.service';
import { maxArrayLength, minArrayLength } from 'src/app/utils/form-validators';
import { ContactFormComponent } from '../contact-form/contact-form.component';

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
  existingContacts: any[] = [];

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
    private modalService: NzModalService,
    private citiesService: CitiesServiceService
  ) { }

  ngOnInit(): void {
    this.getCities();
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

  initializeForm() {
    this.officeForm = this.fb.group({
      idOfficeProviderTemporal: [null],
      emails: this.fb.array([
        this.fb.control('', [Validators.required, Validators.email])
      ], [minArrayLength(1), maxArrayLength(5)]),
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
      ], [minArrayLength(1), maxArrayLength(5)]),
      datingEmail: ['', [Validators.required, Validators.email]],

      updatedContacts: this.fb.array([]),
      createdContacts: this.fb.array([]),
      deletedContacts: this.fb.array([])

      // nameLegalRepresentation: ['', [Validators.required]],
      // identificationLegalRepresentation: ['', [Validators.required]],
      // expeditionLocation: ['', [Validators.required]],
      // expeditionDate: ['', [Validators.required]],
      // telephoneLegalRepresentation: ['', [Validators.required]],
      // emailLegalRepresentation: ['', [Validators.required, Validators.email]],

      // managerName: ['', [Validators.required]],
      // managerTelephone: ['', [Validators.required]],
      // managerEmail: ['', [Validators.required, Validators.email]],

      // administratorName: ['', [Validators.required]],
      // administratorTelephone: ['', [Validators.required]],
      // administratorEmail: ['', [Validators.required, Validators.email]],

      // businessName: ['', [Validators.required]],
      // businessTelephone: ['', [Validators.required]],
      // businessEmail: ['', [Validators.required, Validators.email]],

      // billingName: ['', [Validators.required]],
      // billingTelephone: ['', [Validators.required]],
      // billingEmail: ['', [Validators.required, Validators.email]],

      // authorizationsName: ['', [Validators.required]],
      // authorizationsTelephone: ['', [Validators.required]],
      // authorizationsEmail: ['', [Validators.required, Validators.email]],
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

  get emailsArray(): FormArray {
    return this.officeForm.get('emails') as FormArray;
  }
  addEmail(): void {
    if (this.emailsArray.length < 5) {
      this.emailsArray.push(this.fb.control('', [Validators.required, Validators.email]));
    }
  }
  removeEmail(index: number): void {
    if (this.emailsArray.length > 1) {
      this.emailsArray.removeAt(index);
    }
  }

  get datingWhatsappLinesArray(): FormArray {
    return this.officeForm.get('datingWhatsappLines') as FormArray;
  }
  addDatingWhatsappLine(): void {
    if (this.datingWhatsappLinesArray.length < 5) {
      this.datingWhatsappLinesArray.push(this.fb.control('', [Validators.required]));
    }
  }
  removeDatingWhatsappLine(index: number): void {
    if (this.datingWhatsappLinesArray.length > 1) {
      this.datingWhatsappLinesArray.removeAt(index);
    }
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

  deleteContact(index: number): void {
    const deletedContact = this.existingContacts[index];

    // Remuevo de existingContacts
    this.existingContacts.splice(index, 1);

    if (deletedContact.idContactTemporal !== null) {
      // Buscar en updatedContacts y eliminar si existe
      const updatedIndex = this.updatedContacts.controls.findIndex(office =>
        office.value.idContactTemporal == deletedContact.idContactTemporal
      );
      if (updatedIndex !== -1) {
        this.updatedContacts.removeAt(updatedIndex);
      }
      // Hago push al array de eliminados si es una sede existente
      this.deletedContacts.push(this.fb.control(deletedContact.idContactTemporal));
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

  onSubmit() {
    if (this.officeForm.invalid) {
      // this.officeForm.markAllAsTouched();
      Object.values(this.officeForm.controls).forEach(control => {
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
    }
    this.modal.close({
      office: this.officeForm.value,
      isNew: this.office === null
    });
  }
}
