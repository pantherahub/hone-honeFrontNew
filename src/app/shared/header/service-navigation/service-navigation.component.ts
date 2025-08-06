import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
import { NavigationService } from 'src/app/services/navigation/navigation.service';

@Component({
  selector: 'app-service-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './service-navigation.component.html',
  styleUrl: './service-navigation.component.scss'
})
export class ServiceNavigationComponent implements OnInit, OnDestroy {

  clientSelected: any = this.eventManager.clientSelected();

  serviceRoutes = [
    {
      path: '/documentation',
      label: 'Documentación',
      tab: 'Documentos',
    },
    {
      path: '/billling',
      label: 'Facturación',
      tab: 'Facturación',
    },
    {
      path: '/rips',
      label: 'Rips',
      tab: 'RIPS',
    }
  ];

  currentLabel: string = '';
  private sub!: Subscription;

  constructor(
    private eventManager: EventManagerService,
    private navigationService: NavigationService,
  ) { }

  ngOnInit(): void {
    this.navigationService.getCurrentUrl$().subscribe(url => {
      this.clientSelected = this.eventManager.clientSelected();
      this.setCurrentLabel(url ?? '');
    });
  }

  setCurrentLabel(currentUrl: string): void {
    const found = this.serviceRoutes.find(r => r.path === currentUrl);
    this.currentLabel = found ? found.label : '';
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

}
