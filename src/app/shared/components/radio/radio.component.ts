import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-radio',
  standalone: true,
  imports: [],
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioComponent),
      multi: true
    }
  ]
})
export class RadioComponent implements ControlValueAccessor {

  @Input() id?: string;
  @Input() name?: string;
  @Input() disabled = false;
  @Input() value: any;

  /**
   * Only use when managing state externally.
   * Do not use with ngModel and formControl.
   */
  @Input() checked?: boolean;

  @Output() change = new EventEmitter<any>();
  @Output() onClick = new EventEmitter<Event>();

  private isNgModelUsed = false;
  private modelValue: any;

  get isChecked(): boolean {
    return this.isNgModelUsed ? this.modelValue === this.value : !!this.checked;
  }

  // ControlValueAccessor
  private onChange = (_: any) => {};
  private onTouched = () => {};

  writeValue(value: any): void {
    this.modelValue = value;
  }

  registerOnChange(fn: any): void {
    this.isNgModelUsed = true;
    if (this.checked != null) {
      console.warn(
        'app-radio: Using ngModel/formControl and checked prop at the same time. This can cause conflicts.'
      );
    }
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputClick(event: Event): void {
    if (this.disabled) {
      event.preventDefault();
      return;
    }

    if (this.isNgModelUsed) {
      this.modelValue = this.value;
      this.onChange(this.modelValue);
      this.onTouched();
      this.change.emit(this.modelValue);
    } else {
      this.onClick.emit(event);
    }
  }

}
