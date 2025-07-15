import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, forwardRef, HostListener, Injector, Input, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    }
  ]
})
export class SelectComponent implements ControlValueAccessor {

  @Input() items: { label: string; value: any }[] = [];
  @Input() placeholder: string = 'Seleccionar';
  @Input() searchable = false;
  @Input() selected: any = null;
  @Input() hasError = false;
  @Output() selectedChange = new EventEmitter<any>();

  @ViewChild('dropdownRef') dropdownRef!: ElementRef<HTMLDivElement>;

  isOpen = false;
  searchTerm = '';

  private _disabled = false;
  @Input()
  set disabled(value: boolean) {
    this._disabled = value;
    if (value) this.isOpen = false;
  }
  get disabled(): boolean {
    return this._disabled;
  }

  private ngControl?: NgControl;

  constructor(
    private injector: Injector
  ) { }

  ngOnInit(): void {
    this.ngControl = this.injector.get(NgControl, { optional: true, self: true });
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  toggleDropdown() {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (!this.isOpen) this.clearSearch();
  }

  selectItem(item: any) {
    if (this.disabled) return;
    this.selected = item.value;
    this.onChange(this.selected);
    this.onTouched();
    this.selectedChange.emit(this.selected);
    this.isOpen = false;
    this.clearSearch();
  }

  get selectedLabel(): string {
    const found = this.items.find(i => i.value === this.selected);
    return found?.label || this.placeholder;
  }

  // Cierra si se hace click afuera
  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: HTMLElement) {
    if (!this.dropdownRef?.nativeElement.contains(target)) {
      this.isOpen = false;
    }
  }

  // ControlValueAccessor
  onChange = (_: any) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    this.selected = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  get showError(): boolean {
    const control = this.ngControl?.control;
    return this.hasError || !!(control && control.invalid && control.touched);
  }

  get filteredItems() {
    if (!this.searchable || !this.searchTerm.trim()) return this.items;
    return this.items.filter(i =>
      i.label.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  clearSearch() {
    this.searchTerm = '';
  }

}
