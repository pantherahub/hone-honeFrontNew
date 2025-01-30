import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { ContactsProviderServicesService } from 'src/app/services/contacts-provider/contacts-provider.services.service';
import { maxArrayLength, minArrayLength } from 'src/app/utils/form-validators';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [NgZorroModule, CommonModule],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss'
})
export class ContactFormComponent implements OnInit {

  @Input() contact: any | null = null;
  contactForm!: FormGroup;

  contactOccupations: any[] = [];

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
    private contactsProviderService: ContactsProviderServicesService
  ) { }

  ngOnInit(): void {
    this.getContactOccupations();
    this.initializeForm();
  }

  getContactOccupations() {
    this.contactsProviderService.getOccupation().subscribe({
      next: (data: any) => {
        this.contactOccupations = data;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  initializeForm() {
    this.contactForm = this.fb.group({
      idContactTemporal: [null],
      occupationId: ['', [Validators.required]],
      name: ['', [Validators.required]],
      emails: this.fb.array([
        this.fb.control('', [Validators.required, Validators.email])
      ], [minArrayLength(1), maxArrayLength(5)]),
      telephones: this.fb.array([
        this.fb.control('', [Validators.required])
      ], [minArrayLength(1), maxArrayLength(5)]),

      // nameLegalRepresentation: ['', [Validators.required]],
      // identificationLegalRepresentation: ['', [Validators.required]],
      // expeditionLocation: ['', [Validators.required]],
      // expeditionDate: ['', [Validators.required]],
      // telephoneLegalRepresentation: ['', [Validators.required]],
      // emailLegalRepresentation: ['', [Validators.required, Validators.email]],
    });
  }

  get emailsArray(): FormArray {
    return this.contactForm.get('emails') as FormArray;
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

  get telephonesArray(): FormArray {
    return this.contactForm.get('telephones') as FormArray;
  }
  addTelephone(): void {
    if (this.telephonesArray.length < 5) {
      this.telephonesArray.push(this.fb.control('', [Validators.required]));
    }
  }
  removeTelephone(index: number): void {
    if (this.telephonesArray.length > 1) {
      this.telephonesArray.removeAt(index);
    }
  }

  onSubmit() {
    if (this.contactForm.invalid) {
      // this.contactForm.markAllAsTouched();
      Object.values(this.contactForm.controls).forEach(control => {
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
      office: this.contactForm.value,
      isNew: this.contact === null
    });
  }

}
