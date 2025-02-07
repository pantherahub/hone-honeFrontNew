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
   * Url validator. REVISAR
   */
  url(control: AbstractControl): ValidationErrors | null {
    if (!control || !control.value) return null;
    const urlPattern = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(\/\S*)?$/i;
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

}
