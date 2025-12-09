import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Toast } from 'src/app/models/toast.interface';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent implements OnInit {

  @Input() toast!: Toast;
  @Output() dismiss = new EventEmitter<void>();

  closing = false;

  iconMap = {
    success: 'general.svg#check',
    danger: 'general.svg#close-circle',
    info: 'general.svg#info-circle',
    warning: 'general.svg#warning'
  };

  colorMap = {
    success: 'bg-green-100 text-green-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue1h-100 text-blue-700',
    warning: 'bg-yellow-100 text-yellow-700'
  };

  ngOnInit(): void {
    if (this.toast.duration) {
      setTimeout(() => this.close(), this.toast.duration);
    }
  }

  getToastColor() {
    if (this.toast.color) {
      return this.colorMap[this.toast.color];
    }
    return this.colorMap[this.toast.type];
  }

  close(): void {
    this.closing = true;
    setTimeout(() => {
      this.dismiss.emit()
    }, 300);
  }

}
