import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AlertVariant } from 'src/app/models/alert.interface';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
  animations: [
    trigger('fade', [
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class AlertComponent {

  @Input() title: string = '';
  @Input() text: string = '';
  @Input() variant: AlertVariant | 'dark' = 'dark';
  @Input() closable: boolean = false;
  @Input() customIconPath?: string;

  visible = true;

  iconMap: { [variant: string]: string } = {
    success: '/assets/icons/outline/general.svg#check-circle',
    info: '/assets/icons/outline/general.svg#info-circle',
    danger: '/assets/icons/outline/general.svg#exclamation-circle',
    warning: '/assets/icons/outline/general.svg#exclamation-circle',
    dark: '/assets/icons/outline/general.svg#info-circle',
  };

  colorMap: { [variant: string]: string } = {
    success: 'bg-green-100 text-green-700',
    info: 'bg-blue1h-100 text-blue-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    dark: 'bg-gray-100 text-gray-900',
  };

  get iconPath(): string {
    if (this.customIconPath) return this.customIconPath;
    return this.iconMap[this.variant];
  }

  close() {
    this.visible = false;
  }

}
