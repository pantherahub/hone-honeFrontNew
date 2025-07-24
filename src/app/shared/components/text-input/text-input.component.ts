import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Injector, Input, OnInit, Output } from '@angular/core';
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

  @Input() id?: string;
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = ' ';
  @Input() disabled: boolean = false;
  @Input() clearable: boolean = false;
  @Input() searcher: boolean = false;
  @Input() name: string = '';
  @Input() value: any = '';
  @Input() invalid: boolean = false;
  @Input() togglePassword: boolean = false;
  @Input() iconSize: string = '18';
  @Output() onInput = new EventEmitter<any>();

  @Input() maxlength?: string;
  @Input() minlength?: string;
  @Input() max?: string;
  @Input() min?: string;

  onChange: any = () => {};
  onTouched: any = () => { };

  private ngControl?: NgControl;

  showPassword = false;

  constructor(
    private injector: Injector
  ) { }

  ngOnInit(): void {
    this.ngControl = this.injector.get(NgControl, { optional: true, self: true });
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
      this.onInput.emit(val);
    };
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
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
    return this.invalid || !!(control && control.invalid && control.touched);
  }

  clearValue() {
    this.onChange('');
  }

}
