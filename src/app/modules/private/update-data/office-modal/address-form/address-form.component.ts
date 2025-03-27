import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  complementOptions: string[] = ['Este', 'Manzana', 'Noreste', 'Noroccidente', 'Noroeste', 'Norte', 'Occidente', 'Oeste', 'Oriente', 'Sur', 'Sureste', 'Suroccidente', 'Suroeste', 'Suroriente'];
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

    this.addressForm = this.fb.group({
      typeOfRoad: [null, Validators.required],
      roadName: [null, Validators.required],
      roadMainComplement: [null],
      roadSecondaryComplement: [null],
      mainNumber: [null, [Validators.required, Validators.pattern(/^\d{1,2}$/)]],
      mainNumberComplement: [null],
      secondaryNumber: [null, [Validators.required, Validators.pattern(/^\d{1,2}$/)]],
      secondaryNumberComplement: [null],
      neighborhood: [null, Validators.required],
      addressMainComplement: [null],
      addressMainNameComplement: [null],
      // addressMainNameComplement: [{ value: null, disabled: true }],
      addressSecondaryComplement: [null],
      addressSecondaryNameComplement: [null]
      // addressSecondaryNameComplement: [{ value: null, disabled: true }]
    });

    this.addressForm.get('addressMainComplement')?.valueChanges.subscribe(value => {
      console.log("addressMainComplement1111");
      const mainNameComplementControl = this.addressForm.get('addressMainNameComplement');
      if (value) {
        mainNameComplementControl?.setValidators([Validators.required]);
        // this.addressForm.get('addressMainNameComplement')?.enable();
      } else {
        mainNameComplementControl?.clearValidators();
        mainNameComplementControl?.setValue('');
        // this.addressForm.get('addressMainNameComplement')?.disable();
        // this.addressForm.get('addressMainNameComplement')?.reset();
      }
      mainNameComplementControl?.updateValueAndValidity();
    });

    this.addressForm.get('addressSecondaryComplement')?.valueChanges.subscribe(value => {
      console.log("addressSecondaryNameComplement2222");
      const secondaryNameComplementControl = this.addressForm.get('addressSecondaryNameComplement');
      if (value) {
        secondaryNameComplementControl?.setValidators([Validators.required]);
        // this.addressForm.get('addressSecondaryNameComplement')?.enable();
      } else {
        secondaryNameComplementControl?.clearValidators();
        secondaryNameComplementControl?.setValue('');
        // this.addressForm.get('addressSecondaryNameComplement')?.disable();
        // this.addressForm.get('addressSecondaryNameComplement')?.reset();
      }
      secondaryNameComplementControl?.updateValueAndValidity();
    });

    this.addressForm.valueChanges.subscribe(() => {
      this.updateFormattedAddress();
    });
  }

  updateFormattedAddress() {
    console.log("updateFormattedAddress000");

    const {
      typeOfRoad,
      roadName,
      roadMainComplement,
      roadSecondaryComplement,

      mainNumber,
      mainNumberComplement,
      secondaryNumber,
      secondaryNumberComplement,

      neighborhood,

      addressMainComplement,
      addressMainNameComplement,

      addressSecondaryComplement,
      addressSecondaryNameComplement
    } = this.addressForm.value;

    let address = `${typeOfRoad || ''} ${roadName || ''}`;

    if (roadMainComplement) address += ` ${roadMainComplement}`;
    if (roadSecondaryComplement) address += ` ${roadSecondaryComplement}`;

    if (mainNumber || secondaryNumber) {
      address += ` #${mainNumber || ''}`;
      if (mainNumberComplement) address += ` ${mainNumberComplement}`;

      address += ` - ${secondaryNumber || ''}`;
      if (secondaryNumberComplement) address += ` ${secondaryNumberComplement}`;
    }


    if (addressMainComplement) {
      address += ` ${addressMainComplement}`;
      if (addressMainNameComplement) address += ` ${addressMainNameComplement}`;
    }

    if (addressSecondaryComplement) {
      address += ` ${addressSecondaryComplement}`;
      if (addressSecondaryNameComplement) address += ` ${addressSecondaryNameComplement}`;
    }

    if (neighborhood) address += `, ${neighborhood}`;

    this.formattedAddress = address.trim();
  }

  onSubmit() {
    console.log("onSubmit");
    this.formUtils.markFormTouched(this.addressForm);
    if (this.addressForm.invalid) {
      console.log("invalido");
      return;
    }
    return;

    const addressData = this.addressForm.value;
    this.modal.close({ address: addressData });

    // const { tipoVia, numero, complemento, barrio } = this.addressForm.value;
    // let direccion = `${tipoVia} ${numero}`;
    // if (complemento) direccion += ` ${complemento}`;
    // if (barrio) direccion += `, ${barrio}`;

    // this.modal.close({
    //   address: direccion
    // });
  }

}
