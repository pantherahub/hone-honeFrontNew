import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { CitiesServiceService } from 'src/app/services/cities/cities-service.service';
import { ClientProviderService } from 'src/app/services/clients/client-provider.service';
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
  @Input() contactModelType: string = 'provider'; // provider or office
  contactForm!: FormGroup;

  contactOccupations: any[] = [];
  identificationTypes: any[] = [];
  cities: any[] = [];
  telephoneNumberTypes: string[] = ['Celular', 'Fijo', 'Whatsapp'];

  identificationEnabled: boolean = false;

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
    private contactsProviderService: ContactsProviderServicesService,
    private clientProviderService: ClientProviderService,
    private citiesService: CitiesServiceService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.getContactOccupations();
    this.getIdentificationTypes();
    this.getCities();
  }

  getContactOccupations() {
    this.contactOccupations = [];
    // Enviar el id del prestador/sede para que no lleguen cargos unicos ya guardados
    const contactType = this.selectedContactType;
    const contactModelType = this.contactModelType;
    this.contactsProviderService.getOccupation().subscribe({
      next: (data: any) => {
        this.contactOccupations = data;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
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
    this.contactForm = this.fb.group({
      idTemporalContact: [null],
      idOccupation: ['', [Validators.required]],
      type: ['person', [Validators.required]], // person or area
      name: ['', [Validators.required]],
      emails: this.fb.array([
        this.fb.control('', [Validators.required, Validators.email])
      ], [minArrayLength(1), maxArrayLength(5)]),
      telephones: this.fb.array([
        this.createTelephoneGroup()
      ], [minArrayLength(1), maxArrayLength(5)]),

      idTypeDocument: [null],
      identification: [null],
      expeditionDate: [null],
      idCityExpedition: [null],
    });

    this.contactForm.get('type')?.valueChanges.subscribe((value) => {
      // console.log("type Changed");
      if (value === 'area') {
        this.identificationEnabled = false;
      }
      this.getContactOccupations();
      this.contactForm.patchValue({
        name: ''
      });
      this.resetContactDocument();
    });

    this.contactForm.get('idOccupation')?.valueChanges.subscribe((value) => {
      // console.log("idOccupation changed");
      this.identificationEnabled = value === 15;
      this.resetContactDocument();
      this.updateIdentificationValidators();
    });
  }

  resetContactDocument() {
    this.contactForm.patchValue({
      idTypeDocument: null,
      identification: null,
      expeditionDate: null,
      idCityExpedition: null
    });
  }

  updateIdentificationValidators() {
    const idTypeDocumentControl = this.contactForm.get('idTypeDocument');
    const identificationControl = this.contactForm.get('identification');
    const expeditionDateControl = this.contactForm.get('expeditionDate');
    const idCityExpeditionControl = this.contactForm.get('idCityExpedition');

    if (this.identificationEnabled) {
      idTypeDocumentControl?.setValidators([Validators.required]);
      identificationControl?.setValidators([Validators.required]);
      expeditionDateControl?.setValidators([Validators.required]);
      idCityExpeditionControl?.setValidators([Validators.required]);
    } else {
      idTypeDocumentControl?.clearValidators();
      identificationControl?.clearValidators();
      expeditionDateControl?.clearValidators();
      idCityExpeditionControl?.clearValidators();
    }
  }


  get selectedContactType() {
    return this.contactForm.get('type')?.value;
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
  createTelephoneGroup(): FormGroup {
    return this.fb.group({
      type: ['', [Validators.required]],
      number: ['', [Validators.required]]
    });
  }
  addTelephone(): void {
    if (this.telephonesArray.length < 5) {
      this.telephonesArray.push(this.createTelephoneGroup());
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
