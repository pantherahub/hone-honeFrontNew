import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss'
})
export class DrawerComponent implements OnInit, OnDestroy {

  @Input() placement: 'left' | 'right' | 'top' | 'bottom' = 'right';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() customSize?: string;
  @Input() onMobileFull: boolean = true;
  @Input() hasCustomContent: boolean = false;
  @Input() hasFooter: boolean = false;
  @Input() isBackdropVisible: boolean = true;

  @Input() beforeClose?: () => boolean | Promise<boolean>;
  @Input() closable: boolean = true;
  @Input() closeOnBackdrop: boolean = true;
  @Input() closeOnEscape: boolean = true;
  @Input() showCloseButton: boolean = true;

  @Output() onClose = new EventEmitter<any>();

  isMobile: boolean = window.innerWidth < 640;
  isOpen: boolean = false;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    if (!this.closable) {
      this.closeOnBackdrop = false;
      this.closeOnEscape = false;
      this.showCloseButton = false;
    }

    if (this.isOpen && this.isBackdropVisible) {
      document.body.classList.add('overflow-hidden');
    }
  }

  ngOnDestroy(): void {
    document.body.classList.remove('overflow-hidden');
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth < 640;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEsc(event: KeyboardEvent) {
    if (this.closeOnEscape && this.isOpen) {
      this.close();
    }
  }

  onBackdropClick() {
    if (!this.closeOnBackdrop) return;
    this.close();
  }

  open() {
    this.isOpen = true;
    this.cdr.detectChanges();
    if (this.isBackdropVisible) {
      document.body.classList.add('overflow-hidden');
    }
  }

  async close(returnData?: any) {
    if (this.beforeClose) {
      const result = await this.beforeClose();
      if (!result) return;
    }
    this.isOpen = false;
    if (this.isBackdropVisible) {
      document.body.classList.remove('overflow-hidden');
    }
    this.onClose.emit(returnData);
  }

  private effectivePlacement(): 'left' | 'right' | 'top' | 'bottom' {
    if (this.onMobileFull && this.isMobile) {
      return 'bottom';
    }
    return this.placement;
  }

  get drawerClasses(): string {
    const placement = this.effectivePlacement();

    const placements: any = {
      right: `top-0 right-0 h-screen ${this.widthClass()} transform ${this.isOpen ? 'translate-x-0' : 'translate-x-full'}`,
      left: `top-0 left-0 h-screen ${this.widthClass()} transform ${this.isOpen ? 'translate-x-0' : '-translate-x-full'}`,
      top: `top-0 left-0 w-screen ${this.heightClass()} transform ${this.isOpen ? 'translate-y-0' : '-translate-y-full'}`,
      bottom: `bottom-0 left-0 w-screen ${this.heightClass()} transform ${this.isOpen ? 'translate-y-0' : 'translate-y-full'}`,
    };

    return placements[placement];
  }

  private widthClass(): string {
    if (this.customSize) return this.customSize;

    const sizes: Record<string, string> = {
      xs: 'w-80',
      sm: 'w-96',
      md: 'w-[32rem]',
      lg: 'w-[46rem]',
      xl: 'w-[60rem]',
    };

    let sizeClass = sizes[this.size];
    if (this.onMobileFull && this.isMobile && sizeClass) {
      sizeClass = `w-screen sm:${sizeClass}`;
    }
    return sizeClass;
  }

  private heightClass(): string {
    if (this.customSize) return this.customSize;

    const sizes: Record<string, string> = {
      xs: 'h-1/4',
      sm: 'h-1/3',
      md: 'h-1/2',
      lg: 'h-2/3',
      xl: 'h-3/4',
    };

    let sizeClass = sizes[this.size];
    if (this.onMobileFull && this.isMobile && sizeClass) {
      sizeClass = `h-screen sm:${sizeClass}`;
    }
    return sizeClass;
  }

}
