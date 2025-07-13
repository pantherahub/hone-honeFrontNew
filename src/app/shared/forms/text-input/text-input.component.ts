import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Injector, Input, OnInit, Optional, Output, Self } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './text-input.component.html',
  styleUrl: './text-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextInputComponent),
      multi: true,
    },
  ],
})
export class TextInputComponent implements ControlValueAccessor, OnInit {

  @Input() id = '';
  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = ' ';
  @Input() disabled = false;
  @Input() name = '';
  @Input() value: any = '';
  @Input() hasError = false;
  @Input() togglePassword = false;
  @Output() valueChange = new EventEmitter<any>();

  onChange: any = () => {};
  onTouched: any = () => { };

  private ngControl?: NgControl;

  showPassword = false;

  constructor(
    private injector: Injector
  ) { }

  ngOnInit(): void {
    this.ngControl = this.injector.get(NgControl, undefined);
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  writeValue(obj: any): void {
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = (val: any) => {
      this.value = val;
      fn(val);
      this.valueChange.emit(val);
    };
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  handleInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.onChange(val); // Update and emit
  }

  get actualInputType(): string {
    if (this.type === 'password' && this.togglePassword) {
      return this.showPassword ? 'text' : 'password';
    }
    return this.type;
  }

  get showError(): boolean {
    const control = this.ngControl?.control;
    return this.hasError || !!(control && control.invalid && control.touched);
  }

}
