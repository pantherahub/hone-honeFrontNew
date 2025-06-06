import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
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
  @Input() officeIdCity: number | null = null;
  contactForm!: FormGroup;

  contactOccupationTypes: any[] = [];
  contactOccupations: any[] = [];
  identificationTypes: any[] = [];
  cities: any[] = [];
  phoneNumberTypes: string[] = ['Celular', 'Fijo', 'Whatsapp'];

  identificationEnabled: boolean = false;

  savedEmails: any[] = [];
  savedPhones: any[] = [];

  loading: boolean = false;
  loadingSetupContactData: boolean = false;

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

  loadFilteredContactOccupations(occupationType: any, validateForm: boolean = false) {
    this.contactsProviderService.getOccupation(
      occupationType,
      this.contactModelType
    ).subscribe({
      next: (res: any) => {
        const data = res.data
        if (data && data.length) {
          this.contactOccupations = data[0].Occupations;
        }
        if (validateForm) this.formValidationsLoadData();
      },
      error: (err: any) => {
        console.error(err);
        if (validateForm) this.formValidationsLoadData();
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
        this.cities = data.map((option: any) => ({
          ...option,
          label: `${option.city} (${option.indicative})`
        }));
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }
  getSelectedCity(id: number) {
    return this.cities.find(c => c.idCity === id);
  }
  getSelectedIndicative(id: number): string {
    const option = this.getSelectedCity(id);
    return option ? option.indicative : '';
  }

  initializeForm() {
    this.contactForm = this.fb.group({
      idTemporalContact: [null],
      idAddedTemporal: [Date.now().toString()], // Temporary identifier of objects in memory
      idOccupationType: [null, [Validators.required]], // area or person
      idOccupation: [{ value: null, disabled: true }, [Validators.required]],
      occupationName: [''],
      name: [null],
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
        if (this.loadingSetupContactData) return;
        this.onChangeContactType(value);
      });

    this.contactForm.get('idOccupation')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((value) => {
        if (this.loadingSetupContactData) return;
        this.onChangeOccupation(value);
      });

    this.loadContactData();
  }

  onChangeContactType(newValue: any) {
    this.contactForm.patchValue({
      name: null,
      idOccupation: null
    });
    this.contactOccupations = [];

    const nameControl = this.contactForm.get('name');
    const idOccupationControl = this.contactForm.get('idOccupation');

    if (!newValue) {
      nameControl?.clearValidators();
      nameControl?.updateValueAndValidity();
      this.identificationEnabled = false;
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
    this.loadFilteredContactOccupations(newValue);
  }

  onChangeOccupation(newValue: any) {
    // Person and unique occupation
    const enabled = newValue != null && this.getOccupation(newValue)?.unique && this.selectedOccupationType === 2;
    if (enabled != this.identificationEnabled) {
      this.identificationEnabled = enabled;
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

  getOccupation(idOccupation: any) {
    return this.contactOccupations.find(
      occupation => occupation.idOccupation === idOccupation
    );
  }

  setOccupationName(idOccupation: any) {
    const selectedOccupation = this.getOccupation(idOccupation);
    this.contactForm.patchValue({
      occupationName: selectedOccupation?.occupation || ''
    });
  }

  /**
   * If the contact already comes, process name and identification fields.
   */
  formValidationsLoadData() {
    const nameControl = this.contactForm.get('name');
    const idOccupationControl = this.contactForm.get('idOccupation');
    const selectedIdOccupation = idOccupationControl?.value;
    let enabled = false;

    // If it is a person
    if (this.selectedOccupationType === 2) {
      // Convert the name to required
      nameControl?.setValidators([Validators.required]);
      nameControl?.updateValueAndValidity();

      if (selectedIdOccupation != null) {
        let occupation = this.getOccupation(selectedIdOccupation);

        const existingOccupation = this.contactModelType == 'Prestador'
          ? this.contact.OccupationForProvider
          : this.contact.OccupationForOffice;
        if (!occupation && existingOccupation && selectedIdOccupation === existingOccupation.idOccupation) {
          occupation = existingOccupation;
        }

        if (occupation) enabled = occupation.unique;
      }
    }
    // Enable identification fields
    if (enabled != this.identificationEnabled) {
      this.identificationEnabled = enabled;
      this.updateIdentificationValidators(false);
    }
    idOccupationControl?.enable();
    this.loading = false;
    this.loadingSetupContactData = false;
  }

  loadContactData(): void {
    if (this.contact) {
      this.loading = true;
      this.loadingSetupContactData = true;

      const existingOccupation = this.contactModelType == 'Prestador'
        ? this.contact.OccupationForProvider
        : this.contact.OccupationForOffice;

      this.contactForm.patchValue({
        idTemporalContact: this.contact.idTemporalContact,
        idAddedTemporal: this.contact.idAddedTemporal ?? null,
        idOccupationType: this.contact.idOccupationType,
        idOccupation: this.contact.idOccupation,
        occupationName: this.contact.occupationName || existingOccupation?.occupation || '',
        name: this.contact.name,
        idTypeDocument: this.contact.idTypeDocument,
        identification: this.contact.identification,
        expeditionDate: this.contact.expeditionDate,
        idCityExpedition: this.contact.idCityExpedition,
      });
    }

    // Load deletedArrays
    if (this.contact?.deletedEmails) {
      const deletedEmailsArray = this.contactForm.get('deletedEmails') as FormArray;
      this.contact.deletedEmails.forEach((emailId: string) => {
        deletedEmailsArray.push(this.fb.control(emailId));
      });
    }
    if (this.contact?.deletedPhones) {
      const deletedPhonesArray = this.contactForm.get('deletedPhones') as FormArray;
      this.contact.deletedPhones.forEach((phoneId: string) => {
        deletedPhonesArray.push(this.fb.control(phoneId));
      });
    }

    // Validate form and initialize change events
    if (this.contact?.idOccupationType) {
      this.loadFilteredContactOccupations(this.contact.idOccupationType, true);
    } else {
      this.loading = false;
      this.loadingSetupContactData = false;
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

  updateIdentificationValidators(reset: boolean = true) {
    const idTypeDocumentControl = this.contactForm.get('idTypeDocument');
    const identificationControl = this.contactForm.get('identification');
    const expeditionDateControl = this.contactForm.get('expeditionDate');
    const idCityExpeditionControl = this.contactForm.get('idCityExpedition');

    if (reset) {
      idTypeDocumentControl?.reset();
      identificationControl?.reset();
      expeditionDateControl?.reset();
      idCityExpeditionControl?.reset();
    }

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
      const idEmail = emailGroup.get('idEmail')?.value;
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
  createPhoneGroup(phone: any | null = null, activeCity: boolean = false): FormGroup {
    const phoneGroup = this.fb.group({
      idPhone: [phone?.idPhone || null],
      type: [phone?.type || '', [Validators.required]],
      number: [
        phone?.number || '',
        [Validators.required, this.formUtils.telephoneNumber, this.phoneNumberValidator]
      ],
      extension: [
        phone?.extension || null
      ],
      idCity: [phone == null && this.officeIdCity ? this.officeIdCity : phone?.idCity || null],
      status: [phone ? phone.status || null : 'created'] // updated, created, null for existing phones
    });
    if (this.officeIdCity && !activeCity) phoneGroup.get('idCity')?.disable();
    phoneGroup.get('type')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((value) => {
        const idCityControl = phoneGroup.get('idCity');
        let idCity = null;
        if (value === 'Fijo') {
          if (idCityControl?.value) return;
          idCity = this.officeIdCity || null;
          if (this.contactModelType === 'Prestador' && !this.officeIdCity) {
            idCityControl?.setValidators([Validators.required]);
          }
        } else {
          idCityControl?.clearValidators();
        }
        phoneGroup.patchValue({ idCity });

        // Validate number
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
      const phoneGroup = this.phonesArray.at(index);
      const idPhone = phoneGroup.get('idPhone')?.value;
      // Push to deleted array if it already existed
      if (idPhone != null) {
        const deletedPhones = this.contactForm.get('deletedPhones') as FormArray;
        deletedPhones.push(this.fb.control(idPhone));
      }
      this.phonesArray.removeAt(index);
    }
  }
  phoneNumberValidator(control: AbstractControl) {
    if (!control || !control.value || !control.parent) return null;
    const type = control.parent.get('type')?.value;
    const number = control.value;

    if ((type === 'Celular' || type === 'Whatsapp') && number.length !== 10) {
      return { invalidLength: 'Debe ser de 10 dígitos.' };
    }
    if (type === 'Fijo' && (number.length < 6 || number.length > 15)) {
      return { invalidLength: 'Debe tener entre 6 y 15 dígitos.' };
    }
    return null;
  }
  isFijoPhone(control: AbstractControl): boolean {
    return control.get('type')?.value === 'Fijo';
  }

  disableFutureDates = (current: Date): boolean => {
    return current > new Date();
  };

  onSubmit() {
    this.formUtils.trimFormStrControls(this.contactForm);
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
      emailFormGroup.patchValue({
        email: emailFormGroup.value?.email?.toLowerCase() || ''
      });
      const email = emailFormGroup.value;
      const savedEmail = this.savedEmails.find(saved => saved.idEmail === email.idEmail);

      if (email.status === 'created' && !email.idEmail) {
        createdEmailsArray.push(this.createEmailGroup(email));
      } else if (email.status !== 'created' && savedEmail) {
        const isUpdated = savedEmail.email !== email.email || savedEmail.status === 'updated';
        if (isUpdated) {
          emailFormGroup.patchValue({
            status: 'updated'
          });
          updatedEmailsArray.push(this.createEmailGroup(emailFormGroup.value));
        }
      }
    });

    // Verify phone numbers
    this.phonesArray.controls.forEach((phoneGroup: AbstractControl) => {
      const phoneFormGroup = phoneGroup as FormGroup;
      const idCityControl = phoneFormGroup.get('idCity');
      idCityControl?.enable();

      const phone = phoneFormGroup.value;
      const savedPhone = this.savedPhones.find(saved => saved.idPhone === phone.idPhone);

      if (phone.extension !== null && phone.extension.trim() === '') {
        phoneFormGroup.patchValue({ extension: null });
      }

      if (phone.status === 'created' && !phone.idPhone) {
        createdPhonesArray.push(this.createPhoneGroup(phone, true));
      } else if (phone.status !== 'created' && savedPhone) {
        const isUpdated = savedPhone.type !== phone.type
          || savedPhone.number !== phone.number
          || savedPhone.extension !== phone.extension
          || savedPhone.idCity !== phone.idCity
          || savedPhone.status === 'updated';
        if (isUpdated) {
          phoneFormGroup.patchValue({
            status: 'updated'
          });
          updatedPhonesArray.push(this.createPhoneGroup(phoneFormGroup.value, true));
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
