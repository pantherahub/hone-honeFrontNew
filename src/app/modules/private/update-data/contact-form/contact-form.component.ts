import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { distinctUntilChanged } from 'rxjs';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { CitiesServiceService } from 'src/app/services/cities/cities-service.service';
import { ClientProviderService } from 'src/app/services/clients/client-provider.service';
import { ContactsProviderServicesService } from 'src/app/services/contacts-provider/contacts-provider.services.service';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';

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

  contactOccupationTypes: any[] = [];
  contactOccupations: any[] = [];
  identificationTypes: any[] = [];
  cities: any[] = [];
  phoneNumberTypes: string[] = ['Celular', 'Fijo', 'Whatsapp'];

  identificationEnabled: boolean = false;

  savedEmails: any[] = [];
  savedPhones: any[] = [];

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
    private formUtils: FormUtilsService,
    private contactsProviderService: ContactsProviderServicesService,
    private clientProviderService: ClientProviderService,
    private citiesService: CitiesServiceService
  ) { }

  ngOnInit(): void {
    this.initializeForm();

    this.loadContactOccupationTypes();
    this.loadIdentificationTypes();
    this.loadCities();
  }

  loadContactOccupationTypes() {
    /* Mock data */
    this.contactOccupationTypes = [
      {
        idOccupationType: 1,
        name: 'area'
      },
      {
        idOccupationType: 2,
        name: 'persona'
      }
    ];
    return;

    this.contactsProviderService.getOccupationTypes().subscribe({
      next: (data: any) => {
        this.contactOccupationTypes = data;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  loadFilteredContactOccupations() {
    /* Mock data */
    this.contactOccupations = [
      {
          "idOccupation": 1,
          "Occupation": "Gerente"
      },
      {
          "idOccupation": 2,
          "Occupation": "Gerente general"
      },
      {
          "idOccupation": 3,
          "Occupation": "Secretaria gerente"
      },
      {
          "idOccupation": 4,
          "Occupation": "Convenios y contratación"
      },
      {
          "idOccupation": 5,
          "Occupation": "Facturación"
      },
      {
          "idOccupation": 6,
          "Occupation": "Atención al usuario y Trabajo Social"
      },
      {
          "idOccupation": 7,
          "Occupation": "Admisiones"
      },
      {
          "idOccupation": 8,
          "Occupation": "Referencia y contra referencia"
      },
      {
          "idOccupation": 9,
          "Occupation": "Epidemióloga"
      },
      {
          "idOccupation": 10,
          "Occupation": "Coordinadora de Enfermería"
      },
      {
          "idOccupation": 11,
          "Occupation": "Farmacia"
      },
      {
          "idOccupation": 12,
          "Occupation": "Asignacion de citas"
      },
      {
          "idOccupation": 13,
          "Occupation": "Líder de Calidad"
      },
      {
          "idOccupation": 14,
          "Occupation": "Ingeniería 5istemas"
      },
      {
          "idOccupation": 15,
          "Occupation": "Representante legal"
      }
    ]
    // this.contactsProviderService.getOccupation().subscribe({
    //   next: (data: any) => {
    //     this.contactOccupations = data;
    //   },
    //   error: (err: any) => {
    //     console.error(err);
    //   }
    // });
    return;

    this.contactOccupations = [];
    if (!this.contactOccupationTypes.length) return;
    // Update endpoint and filter by provider/office to avoid one-time charges already saved

    const allowedTypes = this.contactModelType === 'provider'
      ? ['prestador', 'compartido']
      : ['sede', 'compartido'];

    this.contactOccupations = this.contactOccupationTypes
      .filter(occupationType => occupationType.idOccupationType === this.selectedOccupationType)
      .flatMap(occupationType => occupationType.Occupations)
      .filter(occupation => allowedTypes.includes(occupation.type));
  }

  loadIdentificationTypes() {
    this.clientProviderService.getIdentificationTypes().subscribe({
      next: (res: any) => {
        this.identificationTypes = res;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  loadCities() {
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
      idOccupationType: [null, [Validators.required]], // person or area
      idOccupation: [null, [Validators.required]],
      name: [''],
      emails: this.fb.array([], [this.formUtils.minArrayLength(1), this.formUtils.maxArrayLength(5)]),
      phones: this.fb.array([], [this.formUtils.minArrayLength(1), this.formUtils.maxArrayLength(5)]),

      idTypeDocument: [null],
      identification: [null],
      expeditionDate: [null],
      idCityExpedition: [null],

      // createdEmails: this.fb.array([]),
      // updatedEmails: this.fb.array([]),
      deletedEmails: this.fb.array([]),

      // createdPhones: this.fb.array([]),
      // updatedPhones: this.fb.array([]),
      deletedPhones: this.fb.array([]),
    });

    this.contactForm.get('idOccupationType')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((value) => {
        this.onChangeContactType(value);
      });

    this.contactForm.get('idOccupation')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((value) => {
        this.onChangeOccupation(value);
      });

    this.loadContactData();
  }

  onChangeContactType(newValue: any) {
    console.log("idOccupationType Changed", newValue);
    this.contactForm.patchValue({
      name: '',
      idOccupation: null
    });
    this.resetContactDocument();

    const nameControl = this.contactForm.get('name');

    if (!newValue) {
      console.log("clear");
      nameControl?.clearValidators();
      nameControl?.updateValueAndValidity();
      this.identificationEnabled = false;
      this.contactOccupations = [];
      return;
    }

    // Equals to 'area'
    if (newValue === 1) {
      console.log("clear");
      nameControl?.clearValidators();
      nameControl?.updateValueAndValidity();
      this.identificationEnabled = false;
    } else {
      console.log("set");
      nameControl?.setValidators([Validators.required]);
      nameControl?.updateValueAndValidity();
    }
    this.loadFilteredContactOccupations();
  }

  onChangeOccupation(newValue: any) {
    console.log("idOccupation Changed", newValue);
    // Legal representation
    this.identificationEnabled = newValue === 15;
    this.resetContactDocument();
    this.updateIdentificationValidators();
  }

  // getContactType(): any {
  //   const selectedIdContactType = this.contactForm.get('idOccupationType')?.value;
  //   if (!selectedIdContactType) return null;
  //   const contactType = this.contactOccupationTypes.find((type: any) => type.idOccupationType === selectedIdContactType);
  //   return contactType;
  // }

  loadContactData(): void {
    console.log("LOADCONTACTDATA");
    if (this.contact) {
      this.contactForm.patchValue({
        idTemporalContact: this.contact.idTemporalContact,
        idOccupationType: this.contact.idOccupationType,
        idOccupation: this.contact.idOccupation,
        name: this.contact.name,
        idTypeDocument: this.contact.idTypeDocument,
        identification: this.contact.identification,
        expeditionDate: this.contact.expeditionDate,
        idCityExpedition: this.contact.idCityExpedition,
      });
    }

    // Load emails
    if (this.contact?.Emails && this.contact?.Emails.length) {
      this.savedEmails = [...this.contact.Emails];
      this.contact.Emails.forEach((email: string) => {
        this.emailsArray.push(this.createEmailGroup(email));
      });
    } else {
      this.addEmail();
    }

    // Load phone numbers
    if (this.contact?.Phones && this.contact?.Phones.length) {
      this.savedPhones = [...this.contact.Phones];
      this.contact.Phones.forEach((phone: any) => {
        this.phonesArray.push(this.createPhoneGroup(phone));
      });
    } else {
      this.addPhone();
    }
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
    idTypeDocumentControl?.updateValueAndValidity();
    identificationControl?.updateValueAndValidity();
    expeditionDateControl?.updateValueAndValidity();
    idCityExpeditionControl?.updateValueAndValidity();
  }

  get selectedOccupationType() {
    return this.contactForm.get('idOccupationType')?.value;
  }

  get emailsArray(): FormArray {
    return this.contactForm.get('emails') as FormArray;
  }
  createEmailGroup(email: any | null = null): FormGroup {
    const emailGroup = this.fb.group({
      idEmail: [email?.idEmail || null],
      email: [email?.email || '', [Validators.required, Validators.email]],
      status: [email ? email.status || null : 'created'] // updated, created, null for existing emails
    });
    return emailGroup;
  }
  addEmail(): void {
    if (this.emailsArray.length < 5) {
      this.emailsArray.push(this.createEmailGroup());
    }
  }
  removeEmail(index: number): void {
    if (this.emailsArray.length > 1) {
      const emailGroup = this.emailsArray.at(index);
      const idEmail = emailGroup.get('idEmail');
      // Push to deleted array if it already existed
      if (idEmail != null) {
        const deletedEmails = this.contactForm.get('deletedEmails') as FormArray;
        deletedEmails.push(this.fb.control(idEmail));
      }
      this.emailsArray.removeAt(index);
    }
  }

  get phonesArray(): FormArray {
    return this.contactForm.get('phones') as FormArray;
  }
  createPhoneGroup(phone: any | null = null): FormGroup {
    const phoneGroup = this.fb.group({
      idPhone: [phone?.idPhone || null],
      type: [phone?.type || '', [Validators.required]],
      number: [phone?.number || '', [Validators.required]],
      status: [phone ? phone.status || null : 'created'] // updated, created, null for existing phones
    });
    return phoneGroup;
  }
  addPhone(): void {
    if (this.phonesArray.length < 5) {
      this.phonesArray.push(this.createPhoneGroup());
    }
  }
  removePhone(index: number): void {
    if (this.phonesArray.length > 1) {
      this.phonesArray.removeAt(index);
    }
  }

  onSubmit() {
    if (this.contactForm.invalid) {
      Object.keys(this.contactForm.controls).forEach((key) => {
        const control = this.contactForm.get(key);

        if (control?.invalid) {
          console.log(`Campo inválido: ${key}, Errores:`, control.errors);
        }
      });
      this.formUtils.markFormTouched(this.contactForm);
      return;
    }

    // Arrays para los emails y phones creados y actualizados
    const createdEmails: any[] = [];
    const updatedEmails: any[] = [];
    const createdPhones: any[] = [];
    const updatedPhones: any[] = [];

    // Verificar los correos electrónicos
    this.emailsArray.controls.forEach((emailGroup: AbstractControl) => {
      const formGroup = emailGroup as FormGroup;
      const email = formGroup.value;
      const savedEmail = this.savedEmails.find(saved => saved.idEmail === email.idEmail);

      if (email.status === 'created' && !email.idEmail) {
        createdEmails.push(email);
      } else if (email.status !== 'created' && savedEmail) {
        const isUpdated = savedEmail.email !== email.email;
        if (isUpdated) {
          email.status = 'updated';
        }
        updatedEmails.push(email);
      }
    });

    // Verificar los números de teléfono
    this.phonesArray.controls.forEach((phoneGroup: AbstractControl) => {
      const formGroup = phoneGroup as FormGroup;
      const phone = formGroup.value;
      const savedPhone = this.savedPhones.find(saved => saved.idPhone === phone.idPhone);

      if (phone.status === 'created' && !phone.idPhone) {
        createdPhones.push(phone);
      } else if (phone.status !== 'created' && savedPhone) {
        const isUpdated = savedPhone.type !== phone.type || savedPhone.number !== phone.number;
        if (isUpdated) {
          phone.status = 'updated';
        }
        updatedPhones.push(phone);
      }
    });

    // Get selected occupation with name
    const selectedOccupation = this.contactOccupations.find(occupation => occupation.idOccupation === this.contactForm.value.idOccupation);
    const contactData = {
      ...this.contactForm.value,
      occupationName: selectedOccupation ? selectedOccupation.Occupation : null,
      createdEmails,
      updatedEmails,
      createdPhones,
      updatedPhones
    };

    this.modal.close({
      contact: contactData,
      isNew: this.contact === null
    });
  }

}
