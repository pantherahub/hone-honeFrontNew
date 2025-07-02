import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isAlphanumeric, isAlphanumericWithSpaces, isEmail, isNumeric, isTelephoneNumber, isUrl } from 'src/app/utils/validation-utils';

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
    return isNumeric(control.value) ? null : { invalidNumber: true };
  }

  /**
   * Alphanumeric validator.
   */
  alphanumeric(control: AbstractControl): ValidationErrors | null {
    if (!control || !control.value) return null;
    return isAlphanumeric(control.value) ? null : { invalidAlphanumeric: true };
  }

  /**
   * Alphanumeric validator.
   */
  alphanumericWithSpaces(control: AbstractControl): ValidationErrors | null {
    if (!control || !control.value) return null;
    return isAlphanumericWithSpaces(control.value) ? null : { invalidAlphanumWithSpaces: true };
  }

  /**
   * Telephone number validator.
   * Allows numbers and #
   */
  telephoneNumber(control: AbstractControl): ValidationErrors | null {
    if (!control || !control.value) return null;
    return isTelephoneNumber(control.value) ? null : { invalidTelNumber: true };
  }

  /**
   * Url validator.
   */
  url(control: AbstractControl): ValidationErrors | null {
    if (!control || !control.value) return null;
    return isUrl(control.value) ? null : { invalidUrl: true };
  }

  /**
   * Email validator.
   */
  email(control: AbstractControl): ValidationErrors | null {
    if (!control || !control.value) return null;
    return isEmail(control.value) ? null : { invalidEmail: true };
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
  markFormTouched(control: AbstractControl, propagateToParent: boolean = false) {
    if (control instanceof FormGroup || control instanceof FormArray) {
      // Recursive call
      Object.values(control.controls).forEach(ctrl => this.markFormTouched(ctrl, propagateToParent));
    } else {
      control.markAsTouched();
      control.markAsDirty();
      control.updateValueAndValidity({ onlySelf: !propagateToParent });
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
   * Validates date ranges.
   * @param startField - The name of the initial date field.
   * @param endField - The name of the final date field.
   * @param errorPrefix - Prefix to identify range in form.
   * @param bothRequired - If both dates are required when one is filled out.
   * @param untilToday - Whether dates must be up to today.
   */
  validateDateRange(
    startField: string,
    endField: string,
    errorPrefix: string,
    bothRequired: boolean = false,
    untilToday: boolean = false,
  ) {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const startDateControl = formGroup.get(startField);
      const endDateControl = formGroup.get(endField);

      if (!startDateControl || !endDateControl) return null;

      // Const to clear errors
      const cleanErrors = (control: AbstractControl, prefix: string) => {
        const currentErrors = control.errors || {};
        Object.keys(currentErrors)
          .filter(key => key.startsWith(prefix))
          .forEach(key => delete currentErrors[key]);

        control.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
      };

      // Const to set errors
      const setError = (control: AbstractControl, errorKey: string) => {
        const currentErrors = control.errors || {};
        currentErrors[errorKey] = true;
        control.setErrors(currentErrors);
      };

      const parseDate = (value: any) => (value ? new Date(value + "T00:00:00") : null);
      const startDate = parseDate(startDateControl.value);
      const endDate = parseDate(endDateControl.value);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const prefix = errorPrefix ? `${errorPrefix}_` : '';

      // Clear previous errors
      cleanErrors(startDateControl, prefix);
      cleanErrors(endDateControl, prefix);

      let hasError = false;

      if (untilToday) {
        if (startDate && startDate > today) {
          setError(startDateControl, `${prefix}invalidStartDate`);
          hasError = true;
        }
        if (endDate && endDate > today) {
          setError(endDateControl, `${prefix}invalidEndDate`);
          hasError = true;
        }
      }

      if (bothRequired) {
        if (!startDate && endDate) {
          setError(startDateControl, `${prefix}startDateRequired`);
          hasError = true;
        }
        if (startDate && !endDate) {
          setError(endDateControl, `${prefix}endDateRequired`);
          hasError = true;
        }
      }

      if (startDate && endDate && endDate < startDate) {
        setError(endDateControl, `${prefix}invalidDateRange`);
        hasError = true;
      }

      return hasError ? {} : null;
    };
  }

  /**
   * Removes all non-numeric characters from a string.
   * @param value - Value to be cleaned.
   * @param toNumberType - Boolean to determine return in string or number.
   * @returns Formatted value.
   */
  sanitizeToNumeric(value: string, toNumberType: boolean = false): string | number | null {
    const sanitized = value.replace(/\D/g, '');
    if (toNumberType) {
      const numeric = parseInt(sanitized, 10);
      return isNaN(numeric) ? null : numeric;
    }
    return sanitized;
  }

  /**
   * Formats a string value as Colombian currency.
   * @param numberValue - Value to format.
   * @returns El valor formateado en formato 'es-CO' (ej: 34.500).
   */
  formatCurrency(numberValue: string | number): string {
    if (numberValue == null) return '';
    const raw = this.sanitizeToNumeric(numberValue.toString());
    if (!raw) return '';
    return Number(raw).toLocaleString('es-CO');
  }


}
