import { Component, Input, TemplateRef } from '@angular/core';
import { ModalComponent } from '../../components/modal/modal.component';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../components/button/button.component';
import { AlertVariant } from 'src/app/models/alert.interface';

@Component({
  selector: 'app-alert-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './alert-modal.component.html',
  styleUrl: './alert-modal.component.scss'
})
export class AlertModalComponent {

  @Input() title: string = '';
  @Input() message: string | TemplateRef<any> = '';
  @Input() messageHTML?: string;
  @Input() variant: AlertVariant = 'info';
  @Input() isConfirmation: boolean = false;
  @Input() showClose: boolean = true;
  @Input() loading: boolean = false;
  @Input() showConfirmBtn: boolean = false;
  @Input() confirmBtnText: string = 'Aceptar';
  @Input() cancelBtnText: string = 'Cancelar';
  @Input() iconVariant?: AlertVariant;
  @Input() confirmBtnVariant?: 'primary' | 'gray' | 'red' | 'green';
  @Input() confirmBtnStyle?: 'solid' | 'soft' | 'ghost';
  @Input() customIconPath?: string;

  constructor(public modal: ModalComponent) { }

  close(value: boolean) {
    this.modal.close(value);
  }

  get iconClasses(): string {
    const variants = {
      danger: 'bg-red-100 text-main-red',
      success: 'bg-green-100 text-blue2h-500',
      warning: 'bg-yellow-100 text-yellow-600',
      info: 'bg-blue-100 text-main-blue1h',
    };
    if (this.iconVariant) return variants[this.iconVariant];
    return variants[this.variant];
  }

  get iconPath(): string {
    if (this.loading) return '/assets/icons/extras/animations.svg#spin';
    else if (this.customIconPath) return this.customIconPath;
    return {
      danger: '/assets/icons/outline/general.svg#close',
      success: '/assets/icons/outline/general.svg#check',
      warning: '/assets/icons/outline/general.svg#exclamation-circle',
      info: '/assets/icons/outline/general.svg#info-circle',
    }[this.variant];
  }

  get resolvedConfirmBtnVariant(): 'primary' | 'gray' | 'red' | 'green' {
    return this.confirmBtnVariant ?? ({
      info: 'primary',
      success: 'green',
      warning: 'gray',
      danger: 'red'
    }[this.variant] as 'primary' | 'gray' | 'red' | 'green');
  }

  get resolvedConfirmBtnStyle(): 'solid' | 'soft' | 'ghost' {
    return this.confirmBtnStyle ?? ({
      info: 'solid',
      success: 'solid',
      warning: 'solid',
      danger: 'soft'
    }[this.variant] as 'solid' | 'soft' | 'ghost');
  }

  isTemplateRef(value: any): value is TemplateRef<any> {
    return value instanceof TemplateRef;
  }

}
