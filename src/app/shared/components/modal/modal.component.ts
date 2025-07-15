import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  static stack: ModalComponent[] = [];

  @Input() closeOnBackdrop: boolean = true;
  @Input() closeOnEscape: boolean = true;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'md';

  @Input() title?: string;
  @Input() showCloseButton: boolean = true;

  @ViewChild('modalEl') modalEl!: ElementRef<HTMLDivElement>;

  private isOpen = false;

  open() {
    this.isOpen = true;
    ModalComponent.stack.push(this);
    this.modalEl.nativeElement.classList.remove('hidden');

    document.body.classList.add('overflow-hidden');
  }

  close() {
    this.isOpen = false;
    const index = ModalComponent.stack.lastIndexOf(this);
    if (index > -1) {
      ModalComponent.stack.splice(index, 1);
    }
    this.modalEl.nativeElement.classList.add('hidden');

    if (ModalComponent.stack.length === 0) {
      document.body.classList.remove('overflow-hidden');
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: KeyboardEvent) {
    const isTopModal = ModalComponent.stack[ModalComponent.stack.length - 1] === this;
    if (this.isOpen && this.closeOnEscape && isTopModal) {
      this.close();
    }
  }

  handleBackdropClick(event: MouseEvent) {
    if (this.closeOnBackdrop && event.target === this.modalEl.nativeElement) {
      this.close();
    }
  }

  get modalSizeClass(): string {
    const sizes = {
      sm: 'sm:max-w-sm',
      md: 'sm:max-w-md',
      lg: 'sm:max-w-lg',
      xl: 'sm:max-w-xl',
      '2xl': 'sm:max-w-2xl',
    };
    return sizes[this.size] ?? sizes['md'];
  }

}
