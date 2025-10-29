import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgZorroModule } from 'src/app/ng-zorro.module';

@Component({
  selector: 'app-backend-errors',
  standalone: true,
  imports: [NgZorroModule, CommonModule],
  templateUrl: './backend-errors.component.html',
  styleUrl: './backend-errors.component.scss'
})
export class BackendErrorsComponent {

  @Input() error: any = null;

  constructor() { }

}
