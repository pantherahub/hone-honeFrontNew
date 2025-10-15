import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ContentChild, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { createPopper, Instance, Placement } from '@popperjs/core';
import { ButtonComponent } from '../button/button.component';
import { OverlayStateService } from 'src/app/services/overlay-state/overlay-state.service';


@Component({
  selector: 'app-popover',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './popover.component.html',
  styleUrl: './popover.component.scss'
})
export class PopoverComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  @Input() contentTemplate?: TemplateRef<any>;
  @Input() title: string = '';
  @Input() text?: string;
  @Input() placement: Placement = 'top';
  @Input() triggerType: 'click' | 'hover' | 'manual' = 'click';
  @Input() highlighted: boolean = false;

  @Input() closable: boolean = true;
  @Input() closeOnBackdrop: boolean = true;
  @Input() closeOnEscape: boolean = true;
  @Input() showCloseButton: boolean = false;

  @Input() extraPopoverClass: string | string[] = '';
  @Input() resetPopoverClass?: string;
  @Input() customTriggerClass: string | string[] = '';
  @Input() autoScrollOnOpen: boolean = false;

  @Input() visible!: boolean;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onClose = new EventEmitter<Event>();

  @ContentChild('triggerTemplate', { static: false }) triggerTemplate?: TemplateRef<any>;

  @ViewChild('triggerEl', { read: ElementRef }) triggerEl!: ElementRef;
  @ViewChild('popoverEl') popoverEl!: ElementRef;
  @ViewChild('backdropEl') backdropEl!: ElementRef;
  @ViewChild('arrowRef', { static: false }) arrowRef?: ElementRef<HTMLElement>;

  private popperInstance?: Instance;

  manualByMethods: boolean = false;

  private isHovering = false;
  private hoverTimeout: any;


  private backdropMouseDown: boolean = false;
  private isLeftClick: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private overlayStateService: OverlayStateService,
  ) { }

  ngOnInit(): void {
    if (!this.closable) {
      this.closeOnBackdrop = false;
      this.closeOnEscape = false;
      this.showCloseButton = false;
    }

    if (this.triggerType === 'manual' && this.visible === undefined) {
      this.manualByMethods = true;
    }

    if (this.visible === undefined) {
      this.visible = false;
    }

  }

  ngAfterViewInit(): void {
    this.initPopper();

    if (this.triggerType === 'hover') {
      this.triggerEl?.nativeElement?.addEventListener('mouseenter', this.onMouseEnter.bind(this));
      this.triggerEl?.nativeElement?.addEventListener('mouseleave', this.onMouseLeave.bind(this));
      this.popoverEl?.nativeElement?.addEventListener('mouseenter', this.onMouseEnter.bind(this));
      this.popoverEl?.nativeElement?.addEventListener('mouseleave', this.onMouseLeave.bind(this));
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && changes['visible'].previousValue !== undefined) {
      const isVisible = changes['visible'].currentValue;
      this.toggleVisibility(isVisible);
    }
  }

  ngOnDestroy(): void {
    if (this.visible) {
      this.visible = false;
      this.toggleVisibility(this.visible);
    }
    this.popperInstance?.destroy();
  }

  private initPopper(): void {
    if (!this.triggerEl || !this.popoverEl) return;

    this.popperInstance = createPopper(
      this.triggerEl.nativeElement,
      this.popoverEl.nativeElement,
      {
        placement: this.placement,
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, this.highlighted ? 15 : 10],
            },
          },
          {
            name: 'arrow',
            options: {
              element: this.arrowRef?.nativeElement,
              padding: 5,
            },
          },
          // { name: 'preventOverflow', options: { padding: 8 } },
          {
            name: 'preventOverflow',
            options: { boundary: 'viewport' },
          },
          {
            name: 'flip',
            options: { fallbackPlacements: ['top', 'bottom', 'right', 'left'] }
          },
          {
            name: 'updatePlacement',
            enabled: true,
            phase: 'write',
            fn: ({ state }) => {
              this.placement = state.placement as Placement;
              this.cdr.markForCheck();
            },
          },
        ],
      }
    );
    this.toggleVisibility(this.visible);
  }

  private toggleVisibility(isVisible: boolean) {
    const popover = this.popoverEl?.nativeElement;
    if (!popover) return;

    if (isVisible) {
      if (this.highlighted) {
        this.overlayStateService.addOverlay();
      }
      requestAnimationFrame(() => {
        this.popperInstance?.update();

        if (this.autoScrollOnOpen) {
          popover.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
          });
        }
      });
    } else {
      if (this.highlighted) {
        this.overlayStateService.removeOverlay();
      }
      this.popperInstance?.update();
    }
  }

  public open() {
    this.visible = true;
    this.cdr.detectChanges();
    if (this.manualByMethods || this.triggerType !== 'manual') {
      this.toggleVisibility(this.visible);
      return;
    }
    this.visibleChange.emit(this.visible);
  }

  public close() {
    this.visible = false;
    this.onClose.emit();
    if (this.manualByMethods || this.triggerType !== 'manual') {
      this.toggleVisibility(this.visible);
      return;
    }
    this.visibleChange.emit(this.visible);
  }

  onTriggerClick(): void {
    if (this.triggerType !== 'click') return;
    if (this.visible) {
      this.close();
      return;
    }
    this.open();
  }

  onMouseEnter() {
    this.isHovering = true;
    clearTimeout(this.hoverTimeout);
    this.open();
  }

  onMouseLeave() {
    this.isHovering = false;
    this.hoverTimeout = setTimeout(() => {
      if (!this.isHovering) {
        this.close();
      }
    }, 150); // Small delay to avoid flickering
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: KeyboardEvent) {
    if (this.visible && this.closeOnEscape) this.close();
  }

  // onBackdropMouseDown(event: MouseEvent) {
  //   this.backdropMouseDown = (event.target === this.backdropEl.nativeElement);
  //   this.isLeftClick = event.button === 0;
  // }
  // onBackdropMouseUp(event: MouseEvent) {
  //   const isBackdrop = event.target === this.backdropEl.nativeElement;
  //   if (
  //     this.closeOnBackdrop &&
  //     this.backdropMouseDown &&
  //     isBackdrop &&
  //     this.isLeftClick
  //   ) {
  //     this.close();
  //   }
  //   // Reset
  //   this.backdropMouseDown = false;
  //   this.isLeftClick = false;
  // }

  get popoverPlacementClasses(): string {
    const map: Record<string, string> = {
      top: '!mx-4',
      bottom: '!mx-4',
      left: '!ms-4',
      right: '!me-4',
    };
    return map[this.placement] ?? map['top'];
  }

  get classMap(): string[] {
    let baseClasses: string[] = []; // scale-95
    baseClasses = [
      this.visible
        ? 'scale-100 opacity-100'
        : 'scale-0 opacity-0 pointer-events-none',
      !this.highlighted ? 'border border-gray-200 dark:border-gray-600' : '',
    ];
    if (this.visible !== undefined) {
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
      // this.popoverPlacementClasses,
      ...extra,
    ];
  }

  get customTriggerClasses(): string {
    if (Array.isArray(this.customTriggerClass)) {
      return this.customTriggerClass
        .filter(item => typeof item === 'string')
        .join(' ');
    }
    return typeof this.customTriggerClass === 'string'
      ? this.customTriggerClass
      : '';
  }


}
