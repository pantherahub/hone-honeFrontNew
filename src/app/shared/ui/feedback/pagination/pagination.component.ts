import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {

  @Input() currentPage: number = 1;
  @Input() itemsPerPage: number = 10;
  @Input() totalItems: number = 0;
  @Input() disabled: boolean = false;
  @Input() ariaLabel: string = 'Paginacion';

  @Output() pageChange = new EventEmitter<number>();

  get normalizedTotalItems(): number {
    return Math.max(0, this.totalItems || 0);
  }

  get normalizedItemsPerPage(): number {
    return Math.max(1, this.itemsPerPage || 1);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.normalizedTotalItems / this.normalizedItemsPerPage));
  }

  get effectiveCurrentPage(): number {
    const page = this.currentPage || 1;
    return Math.min(Math.max(1, page), this.totalPages);
  }

  get visiblePages(): number[] {
    const pages = new Set<number>();

    if (this.normalizedTotalItems === 0) return [1];

    pages.add(1);
    pages.add(this.effectiveCurrentPage);
    pages.add(this.totalPages);

    return Array.from(pages).sort((a, b) => a - b);
  }

  get startRange(): number {
    if (this.normalizedTotalItems === 0) return 0;
    return (this.effectiveCurrentPage - 1) * this.normalizedItemsPerPage + 1;
  }

  get endRange(): number {
    return Math.min(this.effectiveCurrentPage * this.normalizedItemsPerPage, this.normalizedTotalItems);
  }

  get isPreviousDisabled(): boolean {
    return this.disabled || this.effectiveCurrentPage === 1;
  }

  get isNextDisabled(): boolean {
    return this.disabled || this.effectiveCurrentPage === this.totalPages;
  }

  selectPage(page: number): void {
    if (this.disabled) return;

    const targetPage = Math.min(Math.max(1, page), this.totalPages);
    if (targetPage === this.effectiveCurrentPage) return;

    this.pageChange.emit(targetPage);
  }

}
