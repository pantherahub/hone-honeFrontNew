import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
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

  contactOccupations: any[] = [];
  identificationTypes: any[] = [];
  cities: any[] = [];
  phoneNumberTypes: string[] = ['Celular', 'Fijo', 'Whatsapp'];

  identificationEnabled: boolean = false;

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
    this.getContactOccupations();
    this.getIdentificationTypes();
    this.getCities();

    if (this.contact) {
      this.loadContactData();
    }
  }

  getContactOccupations() {
    this.contactOccupations = [];
    // Update endpoint and filter by provider/office to avoid one-time charges already saved
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
      type: ['person', [Validators.required]], // person or area
      idOccupation: [null, [Validators.required]],
      name: ['', [Validators.required]],
      emails: this.fb.array([
        this.fb.control('', [Validators.required, Validators.email])
      ], [this.formUtils.minArrayLength(1), this.formUtils.maxArrayLength(5)]),
      phones: this.fb.array([
        this.createPhoneGroup()
      ], [this.formUtils.minArrayLength(1), this.formUtils.maxArrayLength(5)]),

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
        name: '',
        idOccupation: null
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

  loadContactData(): void {
    if (!this.contact) return;

    this.contactForm.patchValue({
      idTemporalContact: this.contact.idTemporalContact,
      type: this.contact.type,
      idOccupation: this.contact.idOccupation,
      name: this.contact.name,
      idTypeDocument: this.contact.idTypeDocument,
      identification: this.contact.identification,
      expeditionDate: this.contact.expeditionDate,
      idCityExpedition: this.contact.idCityExpedition,
    });

    // Load emails
    if (this.contact.emails && this.contact.emails.length) {
      const emailsArray = this.emailsArray;
      this.contact.emails.forEach((email: string) => {
        emailsArray.push(this.fb.control(email, [Validators.required, Validators.email]));
      });
    }

    // Load phone numbers
    if (this.contact.phones && this.contact.phones.length) {
      const phonesArray = this.phonesArray;
      this.contact.phones.forEach((phone: any) => {
        phonesArray.push(this.fb.group({
          type: [phone.type, [Validators.required]],
          number: [phone.number, [Validators.required]]
        }));
      });
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

  get phonesArray(): FormArray {
    return this.contactForm.get('phones') as FormArray;
  }
  createPhoneGroup(): FormGroup {
    return this.fb.group({
      type: ['', [Validators.required]],
      number: ['', [Validators.required]]
    });
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
      this.formUtils.markFormTouched(this.contactForm);
      return;
    }

    // Get selected occupation with name
    const selectedOccupation = this.contactOccupations.find(occupation => occupation.idOccupation === this.contactForm.value.idOccupation);
    const contactData = {
      ...this.contactForm.value,
      occupationName: selectedOccupation ? selectedOccupation.Occupation : null
    };

    this.modal.close({
      contact: contactData,
      isNew: this.contact === null
    });
  }

}
