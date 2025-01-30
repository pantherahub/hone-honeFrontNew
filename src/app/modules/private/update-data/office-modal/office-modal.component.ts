import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { CitiesServiceService } from 'src/app/services/cities/cities-service.service';
import { ContactsProviderServicesService } from 'src/app/services/contacts-provider/contacts-provider.services.service';

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
  contactOccupations: any[] = [];

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
    private citiesService: CitiesServiceService,
    private contactsProviderService: ContactsProviderServicesService
  ) { }

  ngOnInit(): void {
    this.getCities();
    this.getContactOccupations();
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
    this.officeForm = this.fb.group({
      idOfficeProvider: [null],
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

  onSubmit() {
    if (this.officeForm.invalid) {
      this.officeForm.markAllAsTouched();
      return;
    }
    this.modal.close({
      office: this.officeForm.value,
      isNew: this.office === null
    });
  }
}
