import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgZorroModule } from 'src/app/ng-zorro.module';

@Component({
  selector: 'app-date-picker-input',
  standalone: true,
  imports: [NgZorroModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerInputComponent),
      multi: true,
    },
  ],
  templateUrl: './date-picker-input.component.html',
  styleUrl: './date-picker-input.component.scss'
})
export class DatePickerInputComponent implements ControlValueAccessor {
  private innerValue: string | null = null;
  displayValue: Date | null = null;

  @Input() disableDates: (current: Date) => boolean = () => false;
  @Input() nzShowToday: boolean = true;

  // ControlValueAccessor callbacks
  onChange = (value: string | null) => {};
  onTouched = () => {};

  // ControlValueAccessor implementation
  writeValue(value: string | null): void {
    if (value) {
      console.log(value);
      const [year, month, day] = value.split('-').map(Number);
      this.displayValue = new Date(year, month - 1, day);
    } else {
      this.displayValue = null;
    }
  }

  // Managing changes from the DatePicker
  onDateChange(newValue: Date): void {
    console.log("onDateChange");
    console.log(newValue);
    if (newValue) {
      this.innerValue = newValue.toISOString().split('T')[0];
    } else {
      this.innerValue = null;
    }
    this.onChange(this.innerValue);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Disabled status
  }
}
