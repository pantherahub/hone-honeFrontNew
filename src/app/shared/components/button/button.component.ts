import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {

  @Input() type: 'button' | 'submit' = 'button';
  @Input() variant: 'primary' | 'gray' | 'red' | 'green' = 'primary';
  @Input() styleType: 'solid' | 'soft' | 'ghost' = 'solid';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() customClass: string = '';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() href?: string;
  @Input() routerLink?: string;

  @Output() click = new EventEmitter<Event>();

  readonly variants: Record<string, Record<string, string[]>> = {
    primary: {
      solid: ['text-blue1h-50', 'bg-main-blue1h', 'hover:bg-blue1h-800', 'active:bg-blue1h-700', 'active:ring-2', 'active:ring-blue1h-50', 'focus:bg-blue1h-700', 'focus:ring-2', 'focus:ring-blue1h-50', 'disabled:bg-main-blue1h', 'disabled:ring-2', 'disabled:ring-blue1h-50'],
      soft: ['text-main-blue1h', 'bg-blue1h-100', 'hover:bg-blue1h-200', 'active:bg-blue1h-300', 'focus:bg-blue1h-300', 'disabled:bg-blue1h-100'],
      ghost: ['bg-main-blue1h', 'bg-transparent', 'hover:bg-blue1h-100', 'active:bg-blue1h-200', 'focus:bg-blue1h-200', 'disabled:bg-transparent']
    },
    gray: {
      solid: ['text-gray-50', 'bg-gray-700', 'hover:bg-gray-800', 'active:bg-gray-900', 'focus:bg-gray-900', 'disabled:bg-gray-900'],
      soft: ['text-gray-700', 'bg-gray-600/5', 'hover:bg-gray-600/15', 'active:bg-gray-600/20', 'focus:bg-gray-600/20', 'disabled:bg-gray-600/5'],
      ghost: ['text-gray-700', 'bg-transparent', 'hover:bg-gray-600/5', 'active:text-gray-800', 'active:bg-gray-600/15', 'focus:text-gray-800', 'focus:bg-gray-600/15', 'disabled:text-gray-700', 'disabled:bg-transparent']
    },
    red: {
      solid: ['text-red-100', 'bg-red-700', 'hover:bg-red-800', 'active:bg-red-900', 'active:ring-2', 'active:ring-red-100', 'focus:ring-2', 'focus:bg-red-900', 'focus:ring-red-100', 'disabled:bg-red-700', 'disabled:ring-2', 'disabled:ring-red-100'],
      soft: ['text-red-700', 'bg-red-100', 'hover:bg-red-200', 'active:bg-red-300', 'focus:bg-red-300', 'disabled:bg-red-100'],
      ghost: ['text-red-700', 'bg-transparent', 'hover:bg-red-200', 'active:bg-red-300', 'focus:bg-red-300', 'disabled:bg-transparent']
    },
    green: {
      solid: ['text-green-100', 'bg-green-800', 'hover:bg-green-700', 'active:bg-green-900', 'active:ring-2', 'active:ring-green-100', 'focus:ring-2', 'focus:bg-green-900', 'focus:ring-green-100', 'disabled:bg-green-800', 'disabled:ring-2', 'disabled:ring-green-100'],
      soft: ['text-green-800', 'bg-green-100', 'hover:bg-green-300', 'active:bg-green-500', 'focus:bg-green-500', 'disabled:bg-green-100'],
      ghost: ['text-green-800', 'bg-transparent', 'hover:bg-green-300', 'active:bg-green-500', 'focus:bg-green-500', 'disabled:bg-transparent']
    },
  };

  readonly sizes: Record<string, string[]> = {
    xs: ['px-3', 'py-2', 'text-xs', 'font-semibold'],
    sm: ['px-3', 'py-2', 'text-sm', 'font-semibold'],
    md: ['px-5', 'py-2.5', 'text-sm', 'font-semibold'],
    lg: ['px-5', 'py-3', 'text-base', 'font-semibold'],
    xl: ['px-5', 'py-3.5', 'text-base', 'font-semibold'],
  };

  get computedClasses(): string {
    const base = [
      'flex',
      'items-center',
      'gap-2',
      'rounded-lg',
      'focus:outline-none',
      'disabled:cursor-not-allowed',
      'disabled:opacity-50',
      'transition-colors',
      'duration-200',
    ];

    const classes = [
      ...base,
      ...this.variants[this.variant][this.styleType],
      ...this.sizes[this.size]
    ];

    // customClass has priority over the other classes
    if (this.customClass) {
      classes.push(...this.customClass.split(' '));
    }

    return classes.join(' ');
  }

  onClick(event: Event) {
    if (!this.disabled && !this.href && !this.routerLink) {
      this.click.emit(event);
    }
  }

}
