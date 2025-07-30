import { AfterViewInit, Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterOutlet, ActivatedRoute, Router } from '@angular/router';
import { NgZorroModule } from './ng-zorro.module';
import { IconsProviderModule } from './icons-provider.module';
import { EventManagerService } from './services/events-manager/event-manager.service';
import { initFlowbite } from 'flowbite';
import { ToastContainerComponent } from './shared/alerts/toast-container/toast-container.component';
import { FloatingActionsComponent } from './shared/floating-actions/floating-actions.component';
import { ModalService } from './services/modal/modal.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ CommonModule, RouterOutlet, NgZorroModule, IconsProviderModule, ToastContainerComponent, FloatingActionsComponent ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit {

  // @ViewChild('modalHost', { read: ViewContainerRef, static: true })
  // set modalHost(vcr: ViewContainerRef) {
  //   this.modalService.setRootViewContainerRef(vcr);
  // }

  // @ViewChild('modalHost', { read: ViewContainerRef }) modalHost!: ViewContainerRef;

  constructor(
    private eventManager: EventManagerService,
    private readonly location: Location,
    private modalService: ModalService,
    private viewContainerRef: ViewContainerRef,
  ) {
    this.eventManager.getDataUser();
    this.eventManager.getDataClient();
  }

  ngOnInit(): void {
    initFlowbite();
  }

  ngAfterViewInit() {
    // this.modalService.setRootViewContainerRef(this.modalHost);

    // this.modalService.setRootViewContainerRef(this.viewContainerRef);
  }

}
