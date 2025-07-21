import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterOutlet, ActivatedRoute, Router } from '@angular/router';
import { NgZorroModule } from './ng-zorro.module';
import { IconsProviderModule } from './icons-provider.module';
import { HeaderComponent } from './shared/header/header.component';
import { EventManagerService } from './services/events-manager/event-manager.service';
import { initFlowbite } from 'flowbite';
import { ToastContainerComponent } from './shared/alerts/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ CommonModule, RouterOutlet, NgZorroModule, IconsProviderModule, HeaderComponent, ToastContainerComponent ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'template-login';

  constructor (private eventManager: EventManagerService, private readonly location: Location) {
    this.eventManager.getDataUser();
    this.eventManager.getDataClient();
  }

  ngOnInit(): void {
    initFlowbite();
  }

}
