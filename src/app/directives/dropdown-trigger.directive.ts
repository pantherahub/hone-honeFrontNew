import { AfterViewInit, Directive, ElementRef, Input, OnDestroy } from '@angular/core';
import { Placement } from '@popperjs/core';
import { Dropdown } from 'flowbite';

@Directive({
  selector: '[appDropdownTrigger]',
  standalone: true
})
export class DropdownTriggerDirective implements AfterViewInit, OnDestroy {

  @Input('appDropdownTrigger') targetId!: string;
  @Input() dropdownPlacement: Placement = 'bottom';

  private menuEl!: HTMLElement;
  private triggerEl!: HTMLElement;
  private dropdown!: Dropdown;

  private onTriggerClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (this.dropdown.isVisible()) {
      this.dropdown.hide();
    } else {
      this.dropdown.show();
    }
  };

  private onMenuClick = (e: MouseEvent) => {
    const el = e.target as HTMLElement;
    if (el.closest('[data-dropdown-close]')) {
      e.preventDefault();
      e.stopPropagation();
      this.dropdown.hide();
      // Focus to trigger
      this.triggerEl.focus();
    }
  };

  private onDocumentClick = (e: MouseEvent) => {
    const t = e.target as Node;
    if (!this.menuEl.contains(t) && !this.triggerEl.contains(t)) {
      this.dropdown.hide();
    }
  };

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    this.triggerEl = this.el.nativeElement;

    if (!this.targetId) return;
    const menu = document.getElementById(this.targetId);
    if (!menu) return;

    this.menuEl = menu;

    // Remove flowbite attribute to handle manual
    this.triggerEl.removeAttribute('data-dropdown-toggle');

    this.dropdown = new Dropdown(this.menuEl, this.triggerEl, {
      triggerType: 'none', // manual
      placement: this.dropdownPlacement,
      delay: 0,
    });

    // Move to body
    document.body.appendChild(this.menuEl);

    // Listeners
    this.triggerEl.addEventListener('click', this.onTriggerClick, { passive: false });
    this.menuEl.addEventListener('click', this.onMenuClick, { passive: false });
    document.addEventListener('click', this.onDocumentClick);
  }

  ngOnDestroy(): void {
    if (this.dropdown && typeof this.dropdown.destroy === 'function') {
      this.dropdown.destroy?.();
    }
    this.triggerEl?.removeEventListener('click', this.onTriggerClick as any);
    this.menuEl?.removeEventListener('click', this.onMenuClick as any);
    document.removeEventListener('click', this.onDocumentClick);
    // Remove menu from body
    this.menuEl?.remove();
  }

}
