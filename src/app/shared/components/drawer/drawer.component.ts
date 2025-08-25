import { CommonModule } from '@angular/common';
import { AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, ContentChild, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss'
})
export class DrawerComponent implements OnInit, AfterViewInit, AfterContentInit, OnChanges, OnDestroy {

  @Input() isOpen: boolean = false;
  @Input() placement: 'left' | 'right' | 'top' | 'bottom' = 'right';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() customSize?: string;
  @Input() onMobileFull: boolean = true;
  @Input() hasFooter: boolean = false;
  @Input() isBackdropVisible: boolean = true;

  @Input() beforeClose?: () => boolean | Promise<boolean>;
  @Input() closable: boolean = true;
  @Input() closeOnBackdrop: boolean = true;
  @Input() closeOnEscape: boolean = true;
  @Input() showCloseButton: boolean = true;

  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() onClose = new EventEmitter<any>();

  // @ContentChild('[drawer-footer]') footerContent?: TemplateRef<any>;
  // @ContentChild('[drawer-footer]') footerContent?: ElementRef;
  // @ContentChild('drawerFooter') footerContent?: TemplateRef<any>;
  @ContentChild('drawerFooter', { static: false, read: ElementRef }) footerContent?: ElementRef;

  @ViewChild('courseImage')
  courseImage: any;

  isMobile: boolean = window.innerWidth < 640;
  // hasFooter = false;

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

  ngAfterViewInit(): void {
    // this.hasFooter = !!this.footerContent;
    // this.cdr.detectChanges();
    // console.log("---------this.footerContent", this.footerContent);
    // console.log("this.hasFooter", this.hasFooter);
  }

  ngAfterContentInit(): void {
    // this.hasFooter = !!this.footerContent;
    // this.cdr.detectChanges();
    // console.log("---------this.footerContent", this.footerContent);
    // console.log("this.hasFooter", this.hasFooter);
    // console.log("Course Image: ", this.courseImage);
  }

  ngOnDestroy(): void {
    document.body.classList.remove('overflow-hidden');
  }

  ngOnChanges(): void {
    if (this.isOpen && this.isBackdropVisible) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
      this.close();
    }
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
    this.isOpenChange.emit(this.isOpen);
    this.onClose.emit(returnData);
  }

  // 🔑 Aquí decidimos si usamos el placement real o forzamos "bottom" en mobile
  private effectivePlacement(): 'left' | 'right' | 'top' | 'bottom' {
    if (this.isMobileFull) { // this.onMobileFull && this.isMobile
      return 'bottom';
    }
    return this.placement;
  }

  get drawerClasses(): string {
    // const base = 'fixed bg-white shadow-lg transition-transform duration-300 ease-in-out z-50';

    const placement = this.effectivePlacement();

    const placements: any = {
      right: `top-0 right-0 h-screen ${this.widthClass()} transform ${this.isOpen ? 'translate-x-0' : 'translate-x-full'}`,
      left: `top-0 left-0 h-screen ${this.widthClass()} transform ${this.isOpen ? 'translate-x-0' : '-translate-x-full'}`,
      top: `top-0 left-0 w-screen ${this.heightClass()} transform ${this.isOpen ? 'translate-y-0' : '-translate-y-full'}`,
      bottom: `bottom-0 left-0 w-screen ${this.heightClass()} transform ${this.isOpen ? 'translate-y-0' : 'translate-y-full'}`,
    };

    return placements[placement];
    // return `${base} ${placements[placement]}`;
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
    if (this.onMobileFull && sizeClass) {
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
    if (this.onMobileFull && sizeClass) {
      sizeClass = `h-screen sm:${sizeClass}`;
    }
    return sizeClass;
  }

  get isMobileFull(): boolean {
    return this.onMobileFull && this.isMobile;
  }

}
