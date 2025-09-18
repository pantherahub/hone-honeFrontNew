import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { DrawerComponent } from 'src/app/shared/components/drawer/drawer.component';
import { InputErrorComponent } from 'src/app/shared/components/input-error/input-error.component';
import { SelectComponent } from 'src/app/shared/components/select/select.component';
import { TextInputComponent } from 'src/app/shared/components/text-input/text-input.component';
import { capitalizeWords, trimObjectStrings } from 'src/app/utils/string-utils';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [NgZorroModule, CommonModule, DrawerComponent, ButtonComponent, TextInputComponent, InputErrorComponent, SelectComponent],
  templateUrl: './address-form.component.html',
  styleUrl: './address-form.component.scss'
})
export class AddressFormComponent implements OnInit {

  @Input() address: any | null = null;
  @Output() onClose = new EventEmitter<any>();

  addressForm!: FormGroup;

  viaOptions: string[] = ['Autopista', 'Avenida', 'Av. Calle', 'Av. Carrera', 'Barrio', 'Calle', 'Callejón', 'Carrera', 'Circular', 'Diagonal', 'Kilómetro', 'Pasaje', 'Paso', 'Ramal', 'SubRamal', 'Tramo', 'Transversal', 'Vereda'];

  complementOptions: string[] = ['Este', 'Noreste', 'Noroccidente', 'Noroeste', 'Norte', 'Occidente', 'Oeste', 'Oriente', 'Sur', 'Sureste', 'Suroccidente', 'Suroeste', 'Suroriente'];
  letterOptions: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  lettersWithBis: string[] = ['Bis', ...this.letterOptions];
  allNumberComplementOptions: string[] = [];

  addressMainComplementOptions: string[] = ['Edificio', 'Piso', 'Unidad Residencial', 'Casa', 'Conjunto Residencial', 'Torre', 'Bloque', 'Sector', 'Manzana'];
  addressSecondaryComplementOptions: string[] = ['Apartamento', 'Oficina', 'Local', 'Bodega', 'Consultorio', 'Parqueadero', 'Sótano', 'Cubículo'];

  otherOption: string = 'Otro Valor';

  formattedAddress: string = '';

  customErrorMessagesMap: { [key: string]: any } = {
    mainNumber: {
      pattern: () => 'Ingrese un número de máximo 3 dígitos'
    },
    secondaryNumber: {
      pattern: () => 'Ingrese un número de máximo 3 dígitos'
    },
    roadName: {
      invalidRoadName: (error: string) => error
    },
  };

  @ViewChild('addressDrawer', { static: false }) addressDrawer!: DrawerComponent;

  constructor(
    private fb: FormBuilder,
    private formUtils: FormUtilsService,
  ) { }

  ngOnInit(): void {
    this.allNumberComplementOptions = [...this.complementOptions, ...this.lettersWithBis];
    this.initializeForm();
  }

  open() {
    this.addressForm.reset();
    if (this.address) {
      this.loadAddressData();
    }
    this.addressDrawer.open();
  }

  close(addressData?: any) {
    this.addressForm.reset();
    this.addressDrawer.close(addressData);
  }

  onDrawerClose(addressData?: any) {
    this.onClose.emit(addressData);
  }

  getListWithOther(list: string[]): string[] {
    return [this.otherOption, ...list];
  }

  loadAddressData(): void {
    if (!this.address) return;

    const processNumberComplement = (
      value: string | null,
      validOptions: string[]
    ): { value: string | null, custom: string | null } => {
      if (value && !validOptions.includes(value)) {
        return { value: this.otherOption, custom: value };
      }
      return { value: value || null, custom: null };
    };

    const {
      value: mainNumberComplement,
      custom: customMainNumberCompl
    } = processNumberComplement(this.address.mainNumberComplement, this.lettersWithBis);

    const {
      value: secondaryNumberComplement,
      custom: customSecNumberCompl
    } = processNumberComplement(this.address.secondaryNumberComplement, this.allNumberComplementOptions);

    this.addressForm.patchValue({
      typeOfRoad: this.address.typeOfRoad,
      roadName: this.address.roadName,
      roadMainComplement: this.address.roadMainComplement || null,
      roadSecondaryComplement: this.address.roadSecondaryComplement || null,

      mainNumber: this.address.mainNumber,
      mainNumberComplement,
      customMainNumberCompl,
      secondaryNumber: this.address.secondaryNumber,
      secondaryNumberComplement,
      customSecNumberCompl,

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
      customMainNumberCompl: [null, [this.formUtils.alphanumericWithSpaces, Validators.maxLength(15)]],
      secondaryNumber: [null, [Validators.required, Validators.pattern(/^\d{1,3}$/)]],
      secondaryNumberComplement: [null],
      customSecNumberCompl: [null, [this.formUtils.alphanumericWithSpaces, Validators.maxLength(15)]],

      neighborhood: [null, Validators.required],
      addressMainComplement: [null],
      addressMainNameComplement: [null],

      addressSecondaryComplement: [null],
      addressSecondaryNameComplement: [null],

      formattedAddress: [null]
    });

    this.clearOtherCustomField('mainNumberComplement', 'customMainNumberCompl');
    this.clearOtherCustomField('secondaryNumberComplement', 'customSecNumberCompl');

    this.setupConditionalValidator(
      'addressMainComplement', 'addressMainNameComplement',
      [Validators.required]
    );
    this.setupConditionalValidator(
      'addressSecondaryComplement', 'addressSecondaryNameComplement',
      [Validators.required]
    );

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

  // ValueChanges
  private clearOtherCustomField(
    mainField: string,
    customField: string
  ) {
    const main = this.addressForm.get(mainField);
    const custom = this.addressForm.get(customField);
    if (!main || !custom) return;

    main.valueChanges.subscribe(value => {
      if (value !== this.otherOption) {
        custom.setValue(null);
      }
      custom.updateValueAndValidity();
    });
  }
  // ValueChanges
  private setupConditionalValidator(triggerField: string, dependentField: string, validators: ValidatorFn[]) {
    const trigger = this.addressForm.get(triggerField);
    const dependent = this.addressForm.get(dependentField);
    if (!trigger || !dependent) return;

    trigger.valueChanges.subscribe(value => {
      if (value) {
        dependent.setValidators(validators);
      } else {
        dependent.clearValidators();
        dependent.setValue(null);
      }
      dependent.updateValueAndValidity();
    });
  }

  getFormControl(controlName: string): AbstractControl<any, any> | null {
    return this.addressForm.get(controlName);
  }

  updateFormattedAddress() {
    this.formattedAddress = this.formatAddress(this.addressForm.value);
  }

  private applyOtherCustomField(
    field: string,
    customField: string
  ): void {
    const control = this.addressForm.get(field);
    const custom = this.addressForm.get(customField)?.value;
    if (control?.value === this.otherOption) {
      control.setValue(custom ? custom.toUpperCase() : null);
    }
  }

  onSubmit() {
    this.formUtils.trimFormStrControls(this.addressForm);
    this.formUtils.markFormTouched(this.addressForm);
    if (this.addressForm.invalid) return;

    const roadNameControl = this.addressForm.get('roadName');
    roadNameControl?.setValue(capitalizeWords(roadNameControl?.value));

    this.applyOtherCustomField('mainNumberComplement', 'customMainNumberCompl');
    this.applyOtherCustomField('secondaryNumberComplement', 'customSecNumberCompl');

    this.addressForm.patchValue({
      formattedAddress: this.formattedAddress
    });

    const rawValues = { ...this.addressForm.value };
    ['customMainNumberCompl', 'customSecNumberCompl'].forEach(k => delete rawValues[k]);

    const addressData = Object.fromEntries(
      Object.entries(rawValues).map(([key, value]) => [key, value === "" ? null : value])
    );
    this.close({ address: addressData });
  }

  /**
   * Format address object to string.
   */
  formatAddress(addressObj: any): string {
    addressObj = trimObjectStrings(addressObj);
    const {
      typeOfRoad,
      roadName,
      roadMainComplement,
      roadSecondaryComplement,

      mainNumber,
      mainNumberComplement,
      customMainNumberCompl,
      secondaryNumber,
      secondaryNumberComplement,
      customSecNumberCompl,

      neighborhood,
      addressMainComplement,
      addressMainNameComplement,
      addressSecondaryComplement,
      addressSecondaryNameComplement
    } = addressObj;

    const getNumberComplement = (
      standard: string | null,
      custom: string | null | undefined
    ): string => {
      return standard && standard !== this.otherOption
        ? ` ${standard}`
        : (custom ? ` ${custom.toUpperCase()}` : '');
    };

    let address = `${typeOfRoad || ''} ${roadName || ''}`;

    if (roadMainComplement) address += ` ${roadMainComplement}`;
    if (roadSecondaryComplement) address += ` ${roadSecondaryComplement}`;

    if (mainNumber || secondaryNumber) {
      address += ` #${mainNumber || ''}`;
      address += getNumberComplement(mainNumberComplement, customMainNumberCompl);

      address += ` - ${secondaryNumber || ''}`;
      address += getNumberComplement(secondaryNumberComplement, customSecNumberCompl);
    }

    if (addressMainComplement) {
      address += `, ${addressMainComplement}`;
      if (addressMainNameComplement) address += ` ${addressMainNameComplement}`;
    }
    if (addressSecondaryComplement) {
      address += `, ${addressSecondaryComplement}`;
      if (addressSecondaryNameComplement) address += ` ${addressSecondaryNameComplement}`;
    }

    if (neighborhood) address += `, Barrio ${neighborhood}`;

    return address.trim();
  }

}
