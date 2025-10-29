import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, forwardRef, Injector, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
// import { Datepicker } from 'flowbite';
import { Datepicker } from 'flowbite-datepicker';

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
export class TextInputComponent implements ControlValueAccessor, OnInit, AfterViewInit, OnDestroy {

  @Input() id?: string;
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = ' ';
  @Input() disabled: boolean = false;
  @Input() clearable: boolean = false;
  @Input() searcher: boolean = false;
  @Input() isTextarea: boolean = false;

  @Input() name: string = '';
  @Input() value: any = '';
  @Input() invalid: boolean = false;
  @Input() togglePassword: boolean = false;
  @Input() iconSize: string = '18';
  @Output() onInput = new EventEmitter<any>();
  @Output() onFocus = new EventEmitter<FocusEvent>();

  @Input() rows?: string;
  @Input() maxlength?: string;
  @Input() minlength?: string;
  @Input() max?: string;
  @Input() min?: string;
  @Input() autocomplete?: string;

  onChange: any = () => {};
  onTouched: any = () => { };

  private ngControl?: NgControl;

  showPassword = false;

  private dpInstance: any = null;

  @ViewChild('inputRef', { static: false }) inputRef!: ElementRef<HTMLInputElement | HTMLTextAreaElement>;

  constructor(
    private injector: Injector
  ) { }

  ngOnInit(): void {
    this.ngControl = this.injector.get(NgControl, { optional: true, self: true });
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngAfterViewInit(): void {
    if (this.type === 'date' && this.inputRef) {
      this.initializeDatePicker();
    }
  }

  ngOnDestroy(): void {
    if (this.dpInstance) {
      this.dpInstance.destroy();
      this.dpInstance = null;
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

  handleFocus(event: FocusEvent) {
    this.onFocus.emit(event);
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

  initializeDatePicker() {
    this.dpInstance = new Datepicker(this.inputRef.nativeElement, {
      autohide: true,
      language: 'es',
      format: 'yyyy-mm-dd',
      // orientation: 'bottom',
      todayBtn: 'linked',
      todayHighlight: true,
      autoSelectToday: true,
      clearBtn: true,
    });

    document.addEventListener('mousedown', (e) => {
      if ((e.target as HTMLElement).closest('.datepicker')) {
        e.preventDefault();
      }
    });

    // Traduction
    setTimeout(() => {
      const locales = {
        es: {
          days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
          daysShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
          daysMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
          months: [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
          ],
          monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
          monthsTitle: "Meses",
          today: 'Hoy',
          weekStart: 1,
          clear: 'Limpiar',
          // format: "dd/mm/yyyy"
          format: 'yyyy-mm-dd',
        }
      };

      Object.assign(this.dpInstance.constructor['locales'], locales);
      this.dpInstance.setOptions({ language: 'es' });

      // When the datepicker changes, notify the form
      this.inputRef.nativeElement.addEventListener('changeDate', (e: any) => {
        this.onChange(e.target.value);
      });

      this.dpInstance.element.addEventListener('hide', () => {
        this.inputRef.nativeElement.blur();
      });

      // Today button action
      this.dpInstance.element.addEventListener('show', () => {
        const datepickerPopup = this.dpInstance.picker.element;
        const todayBtn = datepickerPopup.querySelector('.today-btn');
        if (todayBtn && !todayBtn.hasAttribute('data-today-listener')) {
          todayBtn.setAttribute('data-today-listener', 'true');
          todayBtn.addEventListener('click', () => {
            this.dpInstance.setDate(new Date());
            this.onChange(this.inputRef.nativeElement.value);
            this.onTouched();
          });
        }
      });

    }, 100);
  }

}
