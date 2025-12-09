import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-backend-errors',
  standalone: true,
  imports: [CommonModule, AlertComponent],
  templateUrl: './backend-errors.component.html',
  styleUrl: './backend-errors.component.scss'
})
export class BackendErrorsComponent {

  @Input() error: any = null;
  @Input() grouped: boolean = true;

  constructor() { }

}
