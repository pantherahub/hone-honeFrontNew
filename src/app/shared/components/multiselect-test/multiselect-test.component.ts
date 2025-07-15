import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-multiselect-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './multiselect-test.component.html',
  styleUrl: './multiselect-test.component.scss'
})
export class MultiselectTestComponent {

  @Input() options: { label: string; value: any }[] = [];
  @Input() multiple = false;
  @Input() searchable = false;
  @Input() placeholder = 'Selecciona una opción';

  @Output() selectionChange = new EventEmitter<any>();

  selected: any[] = [];
  searchTerm = '';
  dropdownOpen = false;

  toggleOption(option: any) {
    if (this.multiple) {
      const exists = this.selected.find(o => o.value === option.value);
      if (exists) {
        this.selected = this.selected.filter(o => o.value !== option.value);
      } else {
        this.selected.push(option);
      }
    } else {
      this.selected = [option];
      this.dropdownOpen = false;
    }
    this.selectionChange.emit(this.multiple ? this.selected : this.selected[0]);
  }

  filteredOptions(): any[] {
    if (!this.searchable || !this.searchTerm.trim()) return this.options;
    return this.options.filter(opt =>
      opt.label.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

}
