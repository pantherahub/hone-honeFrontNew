import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { format } from 'date-fns';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { distinctUntilChanged } from 'rxjs';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { CitiesService } from 'src/app/services/cities/cities.service';
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
  @Input() contactModelType: string = 'Prestador'; // 'Prestador' or 'Sede'
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
    private citiesService: CitiesService
  ) { }

  ngOnInit(): void {
    this.initializeForm();

    this.loadContactOccupationTypes();
    this.loadIdentificationTypes();
    this.loadCities();
  }

  loadContactOccupationTypes() {
    this.contactsProviderService.getOccupationTypes().subscribe({
      next: (res: any) => {
        this.contactOccupationTypes = res.data;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  loadFilteredContactOccupations() {
    this.contactsProviderService.getOccupation(
      this.selectedOccupationType,
      this.contactModelType
    ).subscribe({
      next: (res: any) => {
        const data = res.data
        if (data && data.length) {
          this.contactOccupations = data[0].Occupations;
        }
      },
      error: (err: any) => {
        console.error(err);
      }
    });
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
      idAddedTemporal: [Date.now().toString()], // Temporary identifier of objects in memory
      idOccupationType: [null, [Validators.required]], // area or person
      idOccupation: [{ value: null, disabled: true }, [Validators.required]],
      occupationName: [''],
      name: [''],
      Emails: this.fb.array([], [this.formUtils.minArrayLength(1), this.formUtils.maxArrayLength(5)]),
      Phones: this.fb.array([], [this.formUtils.minArrayLength(1), this.formUtils.maxArrayLength(5)]),

      idTypeDocument: [null],
      identification: [null],
      expeditionDate: [null],
      idCityExpedition: [null],

      createdEmails: this.fb.array([]),
      updatedEmails: this.fb.array([]),
      deletedEmails: this.fb.array([]),

      createdPhones: this.fb.array([]),
      updatedPhones: this.fb.array([]),
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
    this.contactForm.patchValue({
      name: '',
      idOccupation: null
    });

    const nameControl = this.contactForm.get('name');
    const idOccupationControl = this.contactForm.get('idOccupation');

    if (!newValue) {
      nameControl?.clearValidators();
      nameControl?.updateValueAndValidity();
      this.identificationEnabled = false;
      this.contactOccupations = [];
      idOccupationControl?.disable();
      return;
    }
    idOccupationControl?.enable();

    // Equals to 'area'
    if (newValue === 1) {
      nameControl?.clearValidators();
      nameControl?.updateValueAndValidity();
      this.identificationEnabled = false;
    } else {
      nameControl?.setValidators([Validators.required]);
      nameControl?.updateValueAndValidity();
    }
    this.loadFilteredContactOccupations();
  }

  onChangeOccupation(newValue: any) {
    console.log("idOccupation Changed", newValue);
    // Legal representation
    const idEnabled = newValue === 15;
    if (idEnabled != this.identificationEnabled) {
      this.identificationEnabled = idEnabled;
      this.updateIdentificationValidators();
    }

    // Set occupationName
    if (!this.contact || this.contact.idOccupation !== newValue) {
      this.setOccupationName(newValue);
      return;
    }
    if (this.contact.occupationName === this.contactForm.value.occupationName) {
      return;
    }
    this.setOccupationName(newValue);
  }

  setOccupationName(idOccupation: any) {
    const selectedOccupation = this.contactOccupations.find(
      occupation => occupation.idOccupation === idOccupation
    );
    this.contactForm.patchValue({
      occupationName: selectedOccupation?.occupation || ''
    });
  }

  loadContactData(): void {
    console.log("LOADCONTACTDATA");
    if (this.contact) {
      console.log(this.contact);
      this.contactForm.patchValue({
        idTemporalContact: this.contact.idTemporalContact,
        idAddedTemporal: this.contact.idAddedTemporal ?? null,
        idOccupationType: this.contact.idOccupationType,
        idOccupation: this.contact.idOccupation,
        occupationName: this.contact.occupationName || this.contact?.Occupation?.occupation || '',
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

  updateIdentificationValidators() {
    const idTypeDocumentControl = this.contactForm.get('idTypeDocument');
    const identificationControl = this.contactForm.get('identification');
    const expeditionDateControl = this.contactForm.get('expeditionDate');
    const idCityExpeditionControl = this.contactForm.get('idCityExpedition');

    idTypeDocumentControl?.reset();
    identificationControl?.reset();
    expeditionDateControl?.reset();
    idCityExpeditionControl?.reset();

    if (this.identificationEnabled) {
      idTypeDocumentControl?.setValidators([Validators.required]);
      identificationControl?.setValidators([Validators.required, this.formUtils.numeric]);
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
    return this.contactForm.get('Emails') as FormArray;
  }
  createEmailGroup(email: any | null = null): FormGroup {
    const emailGroup = this.fb.group({
      idEmail: [email?.idEmail || null],
      email: [email?.email || '', [Validators.required, this.formUtils.emailValidator]],
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
    return this.contactForm.get('Phones') as FormArray;
  }
  createPhoneGroup(phone: any | null = null): FormGroup {
    const phoneGroup = this.fb.group({
      idPhone: [phone?.idPhone || null],
      type: [phone?.type || '', [Validators.required]],
      number: [
        phone?.number || '',
        [Validators.required, this.formUtils.numeric, this.phoneNumberValidator]
      ],
      status: [phone ? phone.status || null : 'created'] // updated, created, null for existing phones
    });
    phoneGroup.get('type')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        phoneGroup.get('number')?.updateValueAndValidity();
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
  phoneNumberValidator(control: AbstractControl) {
    console.log("phoneNumberValidator");
    if (!control || !control.value || !control.parent) return null;
    console.log("pasó");
    const type = control.parent.get('type')?.value;
    const number = control.value;
    console.log(number);
    console.log(typeof number);

    if ((type === 'Celular' || type === 'Whatsapp') && number.length !== 10) {
      return { invalidLength: 'Debe ser de 10 dígitos.' };
    }
    if (type === 'Fijo' && (number.length < 6 || number.length > 15)) {
      return { invalidLength: 'Debe tener entre 6 y 15 dígitos.' };
    }
    return null;
  }


  onSubmit() {
    if (this.contactForm.invalid) {
      this.formUtils.markFormTouched(this.contactForm);
      return;
    }

    // Reset the arrays in the form before filling them again
    this.contactForm.setControl('createdEmails', this.fb.array([]));
    this.contactForm.setControl('updatedEmails', this.fb.array([]));
    this.contactForm.setControl('createdPhones', this.fb.array([]));
    this.contactForm.setControl('updatedPhones', this.fb.array([]));

    const createdEmailsArray = this.contactForm.get('createdEmails') as FormArray;
    const updatedEmailsArray = this.contactForm.get('updatedEmails') as FormArray;
    const createdPhonesArray = this.contactForm.get('createdPhones') as FormArray;
    const updatedPhonesArray = this.contactForm.get('updatedPhones') as FormArray;

    // Check emails
    this.emailsArray.controls.forEach((emailGroup: AbstractControl) => {
      const emailFormGroup = emailGroup as FormGroup;
      const email = emailFormGroup.value;
      const savedEmail = this.savedEmails.find(saved => saved.idEmail === email.idEmail);

      // console.log("SAVED_EMAIL:", savedEmail);
      if (email.status === 'created' && !email.idEmail) {
        createdEmailsArray.push(this.createEmailGroup(email));
      } else if (email.status !== 'created' && savedEmail) {
        const isUpdated = savedEmail.email !== email.email || savedEmail.status === 'updated';
        if (isUpdated) {
          emailFormGroup.patchValue({
            status: 'updated'
          });
          updatedEmailsArray.push(this.createEmailGroup(email));
        }
      }
    });

    // Verify phone numbers
    this.phonesArray.controls.forEach((phoneGroup: AbstractControl) => {
      const phoneFormGroup = phoneGroup as FormGroup;
      const phone = phoneFormGroup.value;
      const savedPhone = this.savedPhones.find(saved => saved.idPhone === phone.idPhone);

      if (phone.status === 'created' && !phone.idPhone) {
        createdPhonesArray.push(this.createPhoneGroup(phone));
      } else if (phone.status !== 'created' && savedPhone) {
        const isUpdated = savedPhone.type !== phone.type
          || savedPhone.number !== phone.number
          || savedPhone.status === 'updated';
        if (isUpdated) {
          phoneFormGroup.patchValue({
            status: 'updated'
          });
          // phone.status = 'updated';
          updatedPhonesArray.push(this.createPhoneGroup(phone));
        }
      }
    });

    const expeditionDate = this.contactForm.get('expeditionDate')?.value;
    if (expeditionDate) {
      this.contactForm.patchValue({
        expeditionDate: `${format(expeditionDate, 'yyyy-MM-dd')}T00:00:00`
      });
    }

    this.modal.close({
      contact: this.contactForm,
      isNew: this.contact === null || this.contact.idTemporalContact === null
    });
  }

}
