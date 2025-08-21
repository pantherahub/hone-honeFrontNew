import { AfterViewInit, Directive, ElementRef, OnDestroy } from '@angular/core';
import { Dropdown } from 'flowbite';

@Directive({
  selector: '[appDropdownTrigger]',
  standalone: true
})
export class DropdownTriggerDirective implements AfterViewInit, OnDestroy {

  private $menu: HTMLElement | null = null;
  private dropdownInstance: Dropdown | null = null;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    const trigger = this.el.nativeElement;
    const targetId = trigger.getAttribute('data-dropdown-toggle');
    if (!targetId) return;

    this.$menu = document.getElementById(targetId);
    if (!this.$menu) return;

    // Avoid multiple instances
    // if ((this.$menu as any)._fbDropdownInstance) return;

    this.dropdownInstance = new Dropdown(this.$menu, trigger, {
      placement: trigger.getAttribute('data-dropdown-placement') as any ?? 'bottom',
    });

    // (this.$menu as any)._fbDropdownInstance = instance;
    document.body.appendChild(this.$menu);
  }

  ngOnDestroy(): void {
    if (this.dropdownInstance) {
      this.dropdownInstance.destroy?.();
      this.dropdownInstance = null;
    }

    if (this.$menu) {
      this.$menu.remove();
      this.$menu = null;
    }
  }

}
