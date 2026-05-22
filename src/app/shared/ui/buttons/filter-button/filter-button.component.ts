import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-filter-button',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './filter-button.component.html',
  styleUrl: './filter-button.component.scss'
})
export class FilterButtonComponent {

  @Input() activeCount: number = 0;
  @Input() label: string = 'Filtro';
  @Input() disabled: boolean = false;

  @Output() openFilters = new EventEmitter<void>();
  @Output() clearFilters = new EventEmitter<void>();

  get hasActiveFilters(): boolean {
    return this.activeCount > 0;
  }

  onOpenFilters(): void {
    if (this.disabled) return;
    this.openFilters.emit();
  }

  onClearFilters(event: Event): void {
    event.stopPropagation();
    if (this.disabled) return;
    this.clearFilters.emit();
  }

}
