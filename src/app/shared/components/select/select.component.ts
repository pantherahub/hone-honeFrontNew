import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, forwardRef, HostListener, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { CheckboxComponent } from '../checkbox/checkbox.component';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule, PipesModule, CheckboxComponent],
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
export class SelectComponent implements ControlValueAccessor, OnInit {

  @Input() items: any[] = [];
  @Input() multiple: boolean = false;

  @Input() placeholder: string = 'Seleccionar';
  @Input() clearable: boolean = false;
  @Input() searchable: boolean = false;
  @Input() selected: any = null;
  @Input() invalid: boolean = false;
  @Input() bindLabel?: string;
  @Input() bindValue?: string;
  @Input() maxVisibleSelected?: number;

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

  getItemLabel(itemOrValue: any): string {
    let item = itemOrValue;

    if (this.bindValue && (typeof itemOrValue !== 'object')) {
      item = this.items.find(i => this.areEqual(this.getItemValue(i), itemOrValue));
    }

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

  areEqual(a: any, b: any): boolean {
    return typeof a === 'object' ? JSON.stringify(a) === JSON.stringify(b) : a === b;
  }

  isSelected(item: any): boolean {
    const itemValue = this.getItemValue(item);

    if (this.multiple) {
      return this.selected?.some((s: any) => this.areEqual(s, itemValue));
    }
    return this.areEqual(this.selected, itemValue);
  }

  selectItem(item: any) {
    if (this.disabled) return;

    const value = this.getItemValue(item);

    if (this.multiple) {
      if (!Array.isArray(this.selected)) {
        this.selected = [];
      }

      const index = this.selected.findIndex((s: any) => this.areEqual(s, value));
      if (index > -1) {
        this.selected.splice(index, 1);
      } else {
        this.selected.push(value);
      }
    } else {
      this.selected = value;
      this.closeDropdown();
    }

    this.onChange(this.selected);
    this.selectedChange.emit(this.selected);
    this.onTouched();
  }

  clearSelection(event: MouseEvent) {
    // Prevents the dropdown from closing
    event.stopPropagation();
    if (this.disabled) return;

    this.selected = this.multiple ? [] : null;
    this.onChange(this.selected);
    this.onTouched();
    this.selectedChange.emit(this.selected);
    this.clearSearch();
  }

  removeItem(itemOrValue: any) {
    const value = this.getItemValue(itemOrValue) ?? itemOrValue;
    this.selected = this.selected.filter((s: any) => !this.areEqual(s, value));
    this.onChange(this.selected);
    this.selectedChange.emit(this.selected);
    this.onTouched();
  }

  get selectedLabel(): string {
    if (this.multiple) return this.placeholder || '';
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
    return this.invalid || !!(control && control.invalid && control.touched);
  }

}
