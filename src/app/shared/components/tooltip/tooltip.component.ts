import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { Tooltip } from "flowbite";

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.scss'
})
export class TooltipComponent implements AfterViewInit, OnChanges, OnDestroy {

  @Input() id!: string;
  @Input() text!: string;
  @Input() position: 'top' | 'right' | 'bottom' | 'left' = 'top';
  @Input() trigger: 'hover' | 'click' = 'hover';
  @Input() styleType: 'light' | 'dark' = 'dark';
  @Input() isDisabled: boolean = false;

  @ViewChild('tooltipTarget', { static: true }) tooltipTargetRef!: ElementRef;
  @ViewChild('tooltipElement', { static: true }) tooltipElementRef!: ElementRef;

  private tooltipInstance: Tooltip | null = null;

  // private isTouchDevice(): boolean {
  //   return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  // }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isDisabled'] && !changes['isDisabled'].firstChange) {
      this.toggleTooltipState();
    }
  }

  ngAfterViewInit(): void {
    this.initTooltip();
  }

  private initTooltip(): void {
    if (!this.isDisabled) {
      setTimeout(() => {
        this.tooltipInstance = new Tooltip(
          this.tooltipElementRef.nativeElement,
          this.tooltipTargetRef.nativeElement,
          {
            placement: this.position,
            triggerType: this.trigger,
            // triggerType: this.isTouchDevice() ? 'click' : this.trigger,
            // style: this.styleType,
          }
        );
      });
    }
  }

  private toggleTooltipState(): void {
    if (this.isDisabled) {
      this.tooltipInstance?.hide();
      this.tooltipInstance = null;
    } else {
      this.initTooltip();
    }
  }

  ngOnDestroy(): void {
    if (this.tooltipInstance) {
      this.tooltipInstance.hide();
    }
  }

}
