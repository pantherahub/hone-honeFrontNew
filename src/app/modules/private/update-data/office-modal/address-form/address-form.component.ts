import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [NgZorroModule, CommonModule],
  templateUrl: './address-form.component.html',
  styleUrl: './address-form.component.scss'
})
export class AddressFormComponent implements OnInit {

  @Input() address: any | null = null;
  addressForm!: FormGroup;

  viaOptions: string[] = ['Autopista', 'Avenida', 'Av. Calle', 'Av. Carrera', 'Barrio', 'Calle', 'Callejón', 'Carrera', 'Circular', 'Diagonal', 'Kilómetro', 'Pasaje', 'Paso', 'Ramal', 'SubRamal', 'Tramo', 'Transversal', 'Vereda'];

  complementOptions: string[] = ['Este', 'Noreste', 'Noroccidente', 'Noroeste', 'Norte', 'Occidente', 'Oeste', 'Oriente', 'Sur', 'Sureste', 'Suroccidente', 'Suroeste', 'Suroriente'];
  letterOptions: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  lettersWithBis: string[] = ['Bis', ...this.letterOptions];
  allNumberComplementOptions: string[] = [];

  addressMainComplementOptions: string[] = ['Edificio', 'Piso', 'Unidad Residencial', 'Casa', 'Conjunto Residencial', 'Torre', 'Bloque', 'Sector', 'Manzana'];
  addressSecondaryComplementOptions: string[] = ['Apartamento', 'Oficina', 'Local', 'Bodega', 'Consultorio', 'Parqueadero', 'Sótano', 'Cubículo'];

  formattedAddress: string = '';

  constructor(
    private fb: FormBuilder,
    private modal: NzModalRef,
    private formUtils: FormUtilsService,
  ) { }

  ngOnInit(): void {
    this.allNumberComplementOptions = [...this.complementOptions, ...this.lettersWithBis];
    this.initializeForm();
  }

  loadAddressData(): void {
    if (!this.address) return;
    this.addressForm.patchValue({
      typeOfRoad: this.address.typeOfRoad,
      roadName: this.address.roadName,
      roadMainComplement: this.address.roadMainComplement || null,
      roadSecondaryComplement: this.address.roadSecondaryComplement || null,
      mainNumber: this.address.mainNumber,
      mainNumberComplement: this.address.mainNumberComplement || null,
      secondaryNumber: this.address.secondaryNumber,
      secondaryNumberComplement: this.address.secondaryNumberComplement || null,
      neighborhood: this.address.neighborhood,
      addressMainComplement: this.address.addressMainComplement || null,
      addressMainNameComplement: this.address.addressMainNameComplement || null,

      addressSecondaryComplement: this.address.addressSecondaryComplement || null,
      addressSecondaryNameComplement: this.address.addressSecondaryNameComplement || null,

      formattedAddress: this.address.formattedAddress || null
    });
    this.formattedAddress = this.address.formattedAddress;
  }

  initializeForm() {
    this.addressForm = this.fb.group({
      typeOfRoad: [null, Validators.required],
      roadName: [null, [Validators.required, this.roadNameValidator.bind(this)]],
      roadMainComplement: [null],
      roadSecondaryComplement: [null],
      mainNumber: [null, [Validators.required, Validators.pattern(/^\d{1,3}$/)]],
      mainNumberComplement: [null],
      secondaryNumber: [null, [Validators.required, Validators.pattern(/^\d{1,3}$/)]],
      secondaryNumberComplement: [null],
      neighborhood: [null, Validators.required],

      addressMainComplement: [null],
      addressMainNameComplement: [null],

      addressSecondaryComplement: [null],
      addressSecondaryNameComplement: [null],

      formattedAddress: [null]
    });

    this.addressForm.get('addressMainComplement')?.valueChanges.subscribe(value => {
      const mainNameComplementControl = this.addressForm.get('addressMainNameComplement');
      if (value) {
        mainNameComplementControl?.setValidators([Validators.required]);
      } else {
        mainNameComplementControl?.clearValidators();
        mainNameComplementControl?.setValue('');
      }
      mainNameComplementControl?.updateValueAndValidity();
    });

    this.addressForm.get('addressSecondaryComplement')?.valueChanges.subscribe(value => {
      const secondaryNameComplementControl = this.addressForm.get('addressSecondaryNameComplement');
      if (value) {
        secondaryNameComplementControl?.setValidators([Validators.required]);
      } else {
        secondaryNameComplementControl?.clearValidators();
        secondaryNameComplementControl?.setValue('');
      }
      secondaryNameComplementControl?.updateValueAndValidity();
    });

    this.addressForm.valueChanges.subscribe(() => {
      this.updateFormattedAddress();
    });

    this.loadAddressData();
  }

  roadNameValidator(control: AbstractControl): { [key: string]: any } | null {
    if (!control.value) return null;
    const invalid = this.viaOptions.some(road => road.toLowerCase() === control.value.toLowerCase());
    return invalid ? { invalidRoadName: 'No debe coincidir con un tipo de vía.' } : null;
  }

  getFormControl(controlName: string): AbstractControl<any, any> | null {
    return this.addressForm.get(controlName);
  }

  updateFormattedAddress() {
    this.formattedAddress = this.formUtils.formatAddress(this.addressForm.value);
  }

  onSubmit() {
    this.formUtils.trimFormStrControls(this.addressForm);
    this.formUtils.markFormTouched(this.addressForm);
    if (this.addressForm.invalid) return;

    const roadNameControl = this.addressForm.get('roadName');
    roadNameControl?.setValue(
      this.formUtils.capitalizeWords(roadNameControl?.value)
    );

    this.addressForm.patchValue({
      formattedAddress: this.formattedAddress
    });

    const addressData = Object.fromEntries(
      Object.entries(this.addressForm.value).map(([key, value]) => [key, value === "" ? null : value])
    );
    this.modal.close({ address: addressData });
  }

}
