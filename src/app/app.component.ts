import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NgZorroModule } from './ng-zorro.module';
import { initFlowbite } from 'flowbite';
import { FloatingActionsComponent } from './shared/features/widgets/floating-actions/floating-actions.component';
import { AccessibilityControlsComponent } from './shared/features/widgets/accessibility-controls/accessibility-controls.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NgZorroModule, FloatingActionsComponent, AccessibilityControlsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  constructor(
    private readonly location: Location,
  ) { }

  ngOnInit(): void {
    initFlowbite();
  }

}
