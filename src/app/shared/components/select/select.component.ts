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

  @Input() items: any[] = [];
  @Input() placeholder: string = 'Seleccionar';
  @Input() clearable = false;
  @Input() searchable = false;
  @Input() selected: any = null;
  @Input() hasError = false;
  @Input() bindLabel?: string;
  @Input() bindValue?: string;

  @Output() selectedChange = new EventEmitter<any>();

  @ViewChild('dropdownRef') dropdownRef!: ElementRef<HTMLDivElement>;
  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

  dropdownAbove = false;

  isDropdownInDOM = false;
  isOpen = false;

  searchTerm = '';

  private _disabled = false;
  @Input()
  set disabled(value: boolean) {
    this._disabled = value;
    if (value) {
      this.closeDropdown();
    }
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

  closeDropdown() {
    this.isOpen = false;
    this.isDropdownInDOM = false;
    this.clearSearch();
  }

  toggleDropdown() {
    if (this.disabled) return;

    if (this.isOpen || this.isDropdownInDOM) {
      this.closeDropdown();
      return;
    }

    this.isDropdownInDOM = true;
    setTimeout(() => {
      this.setDropdownPosition();
      this.isOpen = true;

      if (this.searchable) {
        this.searchInputRef?.nativeElement?.focus({ preventScroll: true });
      }
    });
  }

  setDropdownPosition() {
    setTimeout(() => {
      const rect = this.dropdownRef.nativeElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownEl = this.dropdownRef.nativeElement.querySelector('.dropdown-menu');
      let dropdownHeight = 200;

      if (dropdownEl instanceof HTMLElement) {
        dropdownHeight = dropdownEl.offsetHeight;
      }

      // Available space below
      const spaceBelow = viewportHeight - rect.bottom;

      this.dropdownAbove = spaceBelow < dropdownHeight;
    });
  }

  get filteredItems() {
    if (!this.searchable || !this.searchTerm.trim()) return this.items;
    return this.items.filter(i =>
      this.getItemLabel(i).toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  clearSearch() {
    this.searchTerm = '';
  }

  getItemLabel(item: any): string {
    if (this.bindLabel) {
      return item?.[this.bindLabel] ?? '';
    }

    if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
      return String(item);
    }
    return '';
  }

  getItemValue(item: any): any {
    if (!this.bindValue) return item;
    return item?.[this.bindValue];
  }

  isSelected(item: any): boolean {
    const itemValue = this.getItemValue(item);

    if (typeof itemValue === 'object' && itemValue !== null) {
      return JSON.stringify(itemValue) === JSON.stringify(this.selected);
    }
    return itemValue === this.selected;
  }

  selectItem(item: any) {
    if (this.disabled) return;
    this.selected = this.getItemValue(item);
    this.onChange(this.selected);
    this.onTouched();
    this.selectedChange.emit(this.selected);
    this.closeDropdown();
  }

  clearSelection(event: MouseEvent) {
    // Prevents the dropdown from closing
    event.stopPropagation();

    if (this.disabled) return;
    this.selected = null;
    this.onChange(null);
    this.onTouched();
    this.selectedChange.emit(null);
    this.clearSearch();
  }

  get selectedLabel(): string {
    const found = this.items.find(i => this.isSelected(i));
    return found
      ? this.getItemLabel(found)
      : this.placeholder;
  }

  // Closes if clicked outside
  @HostListener('document:mousedown', ['$event.target'])
  onClickOutside(target: HTMLElement) {
    if (!this.dropdownRef?.nativeElement.contains(target)) {
      this.closeDropdown();
    }
  }

  // ControlValueAccessor
  onChange = (_: any) => {};
  onTouched = () => { };

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

}
