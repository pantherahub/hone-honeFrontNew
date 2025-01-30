/* Form Validators */
import { AbstractControl, ValidatorFn } from "@angular/forms";

export function minArrayLength(min: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (control && control.value && control.value.length < min) {
      return { 'minArrayLength': { valid: false } };
    }
    return null;
  };
}

export function maxArrayLength(max: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (control && control.value && control.value.length > max) {
      return { 'maxArrayLength': { valid: false } };
    }
    return null;
  };
}
