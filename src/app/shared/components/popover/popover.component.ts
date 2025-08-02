import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ContentChild, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, Renderer2, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { Popover } from 'flowbite';

@Component({
  selector: 'app-popover',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popover.component.html',
  styleUrl: './popover.component.scss'
})
export class PopoverComponent implements OnInit, AfterViewInit, OnChanges {

  // @Input() trigger!: ElementRef;
  @Input() contentTemplate?: TemplateRef<any>;

  @Input() visible!: boolean;
  @Input() triggerType: 'click' | 'hover' | 'none' = 'click'; // none = manual
  @Input() closable: boolean = true;
  @Input() closeOnBackdrop: boolean = true;
  @Input() closeOnEscape: boolean = true;
  @Input() showCloseButton: boolean = true;
  @Input() title?: string;
  @Input() content: string = '';
  @Input() placement: 'top' | 'right' | 'bottom' | 'left' = 'top';
  @Input() popoverId: string = 'default-popover';
  @Input() highlighted: boolean = false;

  @Input() extraPopoverClass: string | string[] = '';
  @Input() resetPopoverClass?: string;

  @Output() visibleChange = new EventEmitter<boolean>();

  @ViewChild('popoverEl') popoverEl!: ElementRef;
  @ViewChild('backdropEl') backdropEl!: ElementRef;
  // @ContentChild('triggerContainer', { static: false, read: ElementRef }) triggerContentSlot?: ElementRef;
  @ContentChild('triggerTemplate', { static: false }) triggerTemplate?: TemplateRef<any>;

  manualByMethods: boolean = false;

  private backdropMouseDown: boolean = false;
  private isLeftClick: boolean = false;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
  ) { }

  ngOnInit(): void {
    if (!this.closable) {
      this.closeOnBackdrop = false;
      this.closeOnEscape = false;
      this.showCloseButton = false;
    }

    if (this.triggerType === 'none' && this.visible === undefined) {
      this.manualByMethods = true;
      this.visible = false;
    }

  }

  ngAfterViewInit(): void {
    // if (this.trigger) {
    //   this.renderer.listen(this.trigger.nativeElement, 'click', () => {
    //     this.visible = !this.visible;
    //     this.setPosition();
    //   });
    // }

    import('flowbite').then((module) => {
      module.initPopovers();
    //   this.popoverInstance = new Popover(popoverEl, triggerEl, {
    //   placement: this.placement,
    //   triggerType: 'none',
    // });
    });

    if (this.triggerType === 'none') {
      this.toggleVisibility(this.visible);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.triggerType === 'none' && changes['visible']) {
      const isVisible = changes['visible'].currentValue;
      this.toggleVisibility(isVisible);
    }
  }

  private toggleVisibility(isVisible: boolean) {
    const popover = this.popoverEl?.nativeElement;
    if (!popover) return;

    console.log("Cambio", isVisible);

    if (isVisible) {
      popover.classList.remove('invisible', 'opacity-0');
      popover.classList.add('opacity-100');
      if (this.highlighted) {
        document.body.classList.add('overflow-hidden');
      }
    } else {
      popover.classList.remove('opacity-100');
      popover.classList.add('opacity-0');
      // setTimeout(() => popover.classList.add('invisible'), 300);
      if (this.highlighted) {
        document.body.classList.remove('overflow-hidden');
      }
    }
  }

  public open() {
    this.visible = true;
    if (this.manualByMethods) {
      this.toggleVisibility(this.visible);
      return;
    }
    this.visibleChange.emit(this.visible);
  }

  public close() {
    this.visible = false;
    if (this.manualByMethods) {
      this.toggleVisibility(this.visible);
      return;
    }
    this.visibleChange.emit(this.visible);
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: KeyboardEvent) {
    if (this.visible) this.close();
  }

  onBackdropMouseDown(event: MouseEvent) {
    this.backdropMouseDown = (event.target === this.backdropEl.nativeElement);
    this.isLeftClick = event.button === 0;
  }
  onBackdropMouseUp(event: MouseEvent) {
    const isBackdrop = event.target === this.backdropEl.nativeElement;
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

  get popoverPlacementClasses(): string {
    const map: Record<string, string> = {
      top: '!mx-4',
      bottom: '!mx-4',
      // left: '!my-4 !me-4',
      // right: '!my-4 !ms-4',
      left: '!ms-4',
      right: '!me-4',
    };
    return map[this.placement] ?? map['top'];
  }

  get classMap(): string[] {
    let baseClasses: string[] = [];
    if (this.visible !== undefined) {
      baseClasses = [
        this.visible && this.triggerType === 'none'
         ? '!opacity-100 !visible'
         : '!opacity-0',
      ];
    }
    if (this.resetPopoverClass) {
      const reset = Array.isArray(this.resetPopoverClass)
        ? this.resetPopoverClass
        : [this.resetPopoverClass];
      return [...baseClasses, ...reset];
    }

    const extra = Array.isArray(this.extraPopoverClass)
      ? this.extraPopoverClass
      : [this.extraPopoverClass];
    return [
      ...baseClasses,
      this.popoverPlacementClasses,
      ...extra,
    ];
  }



}
