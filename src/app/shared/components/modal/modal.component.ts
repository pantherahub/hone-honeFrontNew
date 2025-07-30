import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, TemplateRef, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent implements OnInit, AfterViewInit {
  static stack: ModalComponent[] = [];

  @Input() closable: boolean = true;
  @Input() closeOnBackdrop: boolean = true;
  @Input() closeOnEscape: boolean = true;
  @Input() showCloseButton: boolean = true;
  @Input() beforeClose?: () => boolean | Promise<boolean>;
  @Input() title?: string;
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'md';
  @Input() customSize?: string;
  @Input() position:
    | 'center'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right' = 'center';
  @Input() isBackdropVisible: boolean = true;
  @Input() customModalClass: string | string[] = '';
  @Input() closingDuration: number = 0; // For animations or loaders

  @Output() onClose = new EventEmitter<any>();

  @ViewChild('modalEl') modalEl!: ElementRef<HTMLDivElement>;
  @ViewChild('content', { read: ViewContainerRef }) contentVCR!: ViewContainerRef;

  private backdropMouseDown: boolean = false;
  private isLeftClick: boolean = false;

  isOpen = false;
  closing = false;

  @Input() afterViewInitCallback?: (vcr: ViewContainerRef) => void;
  hasDynamicViewLoaded = false;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    if (!this.closable) {
      this.closeOnBackdrop = false;
      this.closeOnEscape = false;
      this.showCloseButton = false;
    }
  }

  ngAfterViewInit(): void {
    if (this.afterViewInitCallback) {
      this.afterViewInitCallback(this.contentVCR);
      this.hasDynamicViewLoaded = true;
      this.cdr.detectChanges();
    }
  }

  open() {
    this.isOpen = true;
    this.cdr.detectChanges();
    ModalComponent.stack.push(this);
    this.modalEl.nativeElement.classList.add('flex');
    this.modalEl.nativeElement.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }

  async close(returnData?: any) {
    if (this.beforeClose) {
      const result = await this.beforeClose();
      if (!result) return;
    }

    this.closing = true;
    setTimeout(() => {
      if (document.activeElement instanceof HTMLElement && this.modalEl.nativeElement.contains(document.activeElement)) {
        document.activeElement.blur();
      }

      this.isOpen = false;
      this.closing = false;
      const index = ModalComponent.stack.lastIndexOf(this);
      if (index > -1) {
        ModalComponent.stack.splice(index, 1);
      }

      this.modalEl.nativeElement.classList.add('hidden');
      this.modalEl.nativeElement.classList.remove('flex');

      if (ModalComponent.stack.length === 0) {
        document.body.classList.remove('overflow-hidden');
      }
      this.onClose.emit(returnData);
    }, this.closingDuration);

  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: KeyboardEvent) {
    const isTopModal = ModalComponent.stack[ModalComponent.stack.length - 1] === this;
    if (this.isOpen && this.closeOnEscape && isTopModal) {
      this.close();
    }
  }

  onBackdropMouseDown(event: MouseEvent) {
    this.backdropMouseDown = (event.target === this.modalEl.nativeElement);
    this.isLeftClick = event.button === 0;
  }
  onBackdropMouseUp(event: MouseEvent) {
    const isBackdrop = event.target === this.modalEl.nativeElement;
    if (
      this.closeOnBackdrop &&
      this.backdropMouseDown &&
      isBackdrop &&
      this.isLeftClick
    ) {
      this.close();
    }
    // Reset
    this.backdropMouseDown = false;
    this.isLeftClick = false;
  }

  get modalSizeClass(): string {
    if (this.customSize) return this.customSize;
    const sizes = {
      xs: 'max-w-sm',
      sm: 'max-w-md', // 24rem 284px
      md: 'max-w-lg', // 32rem 512px
      lg: 'max-w-4xl', // 56rem 896px
      xl: 'max-w-7xl',
      '2xl': 'max-w-7xl',
    };
    return sizes[this.size] ?? sizes['md'];
  }

  get positionClasses(): string {
    const map: Record<string, string> = {
      center: 'justify-center items-center',
      top: 'justify-center items-start',
      bottom: 'justify-center items-end',
      left: 'justify-start items-center',
      right: 'justify-end items-center',
      'top-left': 'justify-start items-start',
      'top-right': 'justify-end items-start',
      'bottom-left': 'justify-start items-end',
      'bottom-right': 'justify-end items-end',
    };
    return map[this.position] ?? map['center'];
  }

  get combinedModalClasses(): string[] {
    return [
      this.modalSizeClass,
      ...(Array.isArray(this.customModalClass) ? this.customModalClass : [this.customModalClass])
    ].filter(Boolean); // avoid null/undefined
  }

}
