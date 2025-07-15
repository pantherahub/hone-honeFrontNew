import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-input-label',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input-label.component.html',
  styleUrl: './input-label.component.scss'
})
export class InputLabelComponent {
  @Input() for: string = '';

}
