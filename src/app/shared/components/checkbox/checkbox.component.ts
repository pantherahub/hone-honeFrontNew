import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ]
})
export class CheckboxComponent implements ControlValueAccessor {

  @Input() id?: string;
  @Input() name?: string;
  @Input() disabled: boolean = false;

  /**
   * Only use when managing state externally.
   * Do not use with ngModel and formControl.
   */
  @Input() checked?: boolean;

  @Output() onClick = new EventEmitter<Event>();

  private isNgModelUsed = false;
  private _checkedStatus: boolean = false;

  get checkedValue(): boolean {
    return this.isNgModelUsed ? this._checkedStatus : !!this.checked;
  }

  // ControlValueAccessor callbacks
  private onChange = (_: any) => {};
  private onTouched = () => {};

  writeValue(value: any): void {
    this._checkedStatus = !!value;
  }

  registerOnChange(fn: any): void {
    this.isNgModelUsed = true;
    if (this.isNgModelUsed && this.checked != null) {
      console.warn(
        'app-checkbox: Using ngModel/formControl and check prop at the same time. This can cause conflicts.'
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
      this._checkedStatus = !this._checkedStatus;
      this.onChange(this._checkedStatus);
      this.onTouched();
    } else {
      this.onClick.emit(event);
    }
  }

}
