import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Tooltip } from "flowbite";

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.scss'
})
export class TooltipComponent implements AfterViewInit {

  @Input() id!: string;
  @Input() text!: string;
  @Input() position: 'top' | 'right' | 'bottom' | 'left' = 'top';
  @Input() trigger: 'hover' | 'click' = 'hover';
  @Input() styleType: 'light' | 'dark' = 'dark';

  @ViewChild('tooltipTarget', { static: true }) tooltipTargetRef!: ElementRef;
  @ViewChild('tooltipElement', { static: true }) tooltipElementRef!: ElementRef;

  private tooltipInstance: Tooltip | null = null;

  ngAfterViewInit(): void {
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

  // private isTouchDevice(): boolean {
  //   return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  // }

}
