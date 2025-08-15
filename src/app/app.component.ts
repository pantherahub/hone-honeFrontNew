import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NgZorroModule } from './ng-zorro.module';
import { IconsProviderModule } from './icons-provider.module';
import { EventManagerService } from './services/events-manager/event-manager.service';
import { initFlowbite } from 'flowbite';
import { FloatingActionsComponent } from './shared/floating-actions/floating-actions.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ CommonModule, RouterOutlet, NgZorroModule, IconsProviderModule, FloatingActionsComponent ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  constructor(
    private eventManager: EventManagerService,
    private readonly location: Location,
  ) {
    this.eventManager.getDataUser();
    this.eventManager.getDataClient();
  }

  ngOnInit(): void {
    initFlowbite();
  }

}
