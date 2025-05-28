import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormUtilsService {

  constructor() { }

  /**
   * Form array minimum length validator.
   */
  minArrayLength(min: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control && control.value && control.value.length < min) {
        return { 'minArrayLength': { valid: false } };
      }
      return null;
    };
  }

  /**
   * Form array maximum length validator.
   */
  maxArrayLength(max: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control && control.value && control.value.length > max) {
        return { 'maxArrayLength': { valid: false } };
      }
      return null;
    };
  }

  /**
   * Numeric validator.
   */
  numeric(control: AbstractControl): ValidationErrors | null {
    if (!control || !control.value) return null;
    return /^[0-9]+$/.test(control.value) ? null : { invalidNumber: true };
  }

  /**
   * Telephone number validator.
   * Allows numbers and #
   */
  telephoneNumber(control: AbstractControl): ValidationErrors | null {
    if (!control || !control.value) return null;
    const regex = /^[0-9#]*$/;
    return regex.test(control.value) ? null : { invalidTelNumber: true };
  }

  /**
   * Url validator.
   */
  url(control: AbstractControl): ValidationErrors | null {
    if (!control || !control.value) return null;
    const urlPattern = /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?\/[a-zA-Z0-9]{2,}|((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?)|(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})?/g;
    return urlPattern.test(control.value) ? null : { invalidUrl: true };
  }

  /**
   * Email validator.
   */
  emailValidator(control: AbstractControl): ValidationErrors | null {
    if (!control || !control.value) return null;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(control.value) ? null : { invalidEmail: true };
  }

  /**
   * Remove spaces from FormGroup controls.
   */
  trimFormStrControls(form: FormGroup) {
    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key);
      if (control && typeof control.value === 'string') {
        control.setValue(control.value.trim(), { emitEvent: false });
      }
    });
  }

  /**
   * Validate and mark an entire form recursively.
   */
  markFormTouched(control: AbstractControl) {
    if (control instanceof FormGroup || control instanceof FormArray) {
      // Recursive call
      Object.values(control.controls).forEach(ctrl => this.markFormTouched(ctrl));
    } else {
      control.markAsTouched();
      control.markAsDirty();
      control.updateValueAndValidity({ onlySelf: true });
    }
  }

  /**
   * Clear/Empty a FormArray.
   */
  clearFormArray(formArray: FormArray) {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  /**
   * Format address object to string.
   */
  formatAddress(addressObj: any): string {
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
    } = addressObj;

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

  /**
   * Capitalize connectors in string.
   */
  capitalizeWords(value: string): string {
    const connectors = [
        'de',
        'del',
        'la',
        'las',
        'los',
        'y',
        'a',
        'en',
        'el',
        'al',
        'por',
        'para',
        'con',
        'o'
    ];
    if (typeof value != 'string') return value;

    return value
        .toLowerCase()
        .split(' ')
        .map((word, index) => {
            if (index !== 0 && connectors.includes(word)) {
                return word;
            }
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
  }

  /**
   * Validates date ranges.
   * @param startField - The name of the initial date field.
   * @param endField - The name of the final date field.
   * @param bothRequired - If both dates are required when one is filled out.
   * @param untilToday - Whether dates must be up to today.
   */
  validateDateRange(
    startField: string,
    endField: string,
    bothRequired: boolean = false,
    untilToday: boolean = false,
    errorPrefix: string = '',
  ) {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const startDateControl = formGroup.get(startField);
      const endDateControl = formGroup.get(endField);

      if (!startDateControl || !endDateControl) return null;

      const parseDate = (value: any) => (value ? new Date(value + "T00:00:00") : null);
      const startDate = parseDate(startDateControl.value);
      const endDate = parseDate(endDateControl.value);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Prefix to keep error names unique in forms
      const prefix = errorPrefix ? `${errorPrefix}_` : '';

      if (untilToday) {
        if (startDate && startDate > today) return { [`${prefix}invalidStartDate`]: true };
        if (endDate && endDate > today) return { [`${prefix}invalidEndDate`]: true };
      }

      if (bothRequired) {
        if (!startDate && endDate) return { [`${prefix}startDateRequired`]: true };
        if (startDate && !endDate) return { [`${prefix}endDateRequired`]: true };
      }

      if (startDate && endDate && endDate < startDate) {
        return { [`${prefix}invalidDateRange`]: true };
      }
      return null; // Validation passes
    };
  }

}
