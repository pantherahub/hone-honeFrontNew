import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { GLOBAL_ERROR_MESSAGES } from 'src/app/constants/error-messages';

@Component({
  selector: 'app-input-error',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input-error.component.html',
  styleUrl: './input-error.component.scss'
})
export class InputErrorComponent {

  @Input() control: AbstractControl | null = null;

  /**
   * It can be used for non-reactive inputs.
   */
  @Input() message: string | null = null;

  /**
   * Partial override by field.
   * Ex: { pattern: () => 'Solo letras y números' }
   */
  @Input() customMessages: { [key: string]: (error?: any) => string } = {};

  /**
   * Allows overriding of messages by field
   * Ex: { required: () => 'El campo nombre es requerido' }
   */
  @Input() overrideMessages: { [key: string]: (error?: any) => string } | null = null;

  get errorMessage(): string | null {
    if (this.message) return this.message;

    const control = this.control;
    if (!control || !control.errors || !control.touched) return null;

    const allErrors = control.errors;

    // Prioritize errors according to the order of GLOBAL_ERROR_MESSAGES
    let errorPriority: string[];

    if (this.overrideMessages) {
      // Use only the full override keys
      errorPriority = Object.keys(this.overrideMessages);
    } else {
      // Use global keys and add custom ones if they are not available
      const basePriority = Object.keys(GLOBAL_ERROR_MESSAGES);
      const extraCustomKeys = Object.keys(this.customMessages || {}).filter(
        (key) => !basePriority.includes(key)
      );
      errorPriority = [...basePriority, ...extraCustomKeys];
    }

    for (const key of errorPriority) {
      if (allErrors.hasOwnProperty(key)) {
        const errorVal = allErrors[key];

        // Complete override
        if (this.overrideMessages?.[key]) {
          return this.overrideMessages[key](errorVal);
        }

        // Partial override by field
        if (this.customMessages?.[key]) {
          return this.customMessages[key](errorVal);
        }

        // Default global message
        if (GLOBAL_ERROR_MESSAGES?.[key]) {
          return GLOBAL_ERROR_MESSAGES[key](errorVal);
        }

        // Global fallback using baseKey (useful for prefixed errors)
        const baseKey = key.includes('_') ? key.split('_').slice(1).join('_') : key;
        if (GLOBAL_ERROR_MESSAGES?.[baseKey]) {
          return GLOBAL_ERROR_MESSAGES[baseKey](errorVal);
        }
      }
    }

    return null;
  }

}
