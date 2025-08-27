import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { clientServicesConfig, defaultServices } from 'src/app/config/service-navigation.config';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
import { NavigationService } from 'src/app/services/navigation/navigation.service';

@Component({
  selector: 'app-service-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './service-navigation.component.html',
  styleUrl: './service-navigation.component.scss'
})
export class ServiceNavigationComponent implements OnInit, AfterViewInit, OnDestroy {

  clientSelected: any = this.eventManager.clientSelected();

  allRoutes = [
    {
      key: 'documentation',
      path: '/service/documentation',
      label: 'Documentación',
      tab: 'Documentos',
    },
    // {
    //   key: 'rates',
    //   path: '/service/rates',
    //   label: 'Tarifas',
    //   tab: 'Tarifas',
    // },
    // {
    //   key: 'billing',
    //   path: '/service/billling',
    //   label: 'Facturación',
    //   tab: 'Facturación',
    // },
    // {
    //   key: 'rips',
    //   path: '/service/rips',
    //   label: 'Rips',
    //   tab: 'RIPS',
    // },
  ];

  serviceRoutes: any[] = [];

  currentLabel: string = '';
  private sub!: Subscription;

  @ViewChildren('link') links!: QueryList<ElementRef<HTMLAnchorElement>>;

  constructor(
    private eventManager: EventManagerService,
    private navigationService: NavigationService,
  ) { }

  ngOnInit(): void {
    this.loadRoutes();

    this.navigationService.getCurrentUrl$().subscribe(url => {
      this.clientSelected = this.eventManager.clientSelected();
      this.setCurrentLabel(url ?? '');
    });
  }

  ngAfterViewInit(): void {
    this.scrollToActive();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private loadRoutes(): void {
    const clientId = this.clientSelected?.idClientHoneSolutions;
    const allowedKeys = clientServicesConfig[clientId] ?? defaultServices;

    this.serviceRoutes = this.allRoutes.filter((r) =>
      allowedKeys.includes(r.key)
    );
  }

  setCurrentLabel(currentUrl: string): void {
    const found = this.serviceRoutes.find(r => r.path === currentUrl);
    this.currentLabel = found ? found.label : '';
    setTimeout(() => this.scrollToActive());
  }

  private scrollToActive(): void {
    const active = this.links.find(
      link => link.nativeElement.getAttribute('aria-current') === 'page'
    );
    active?.nativeElement.scrollIntoView({
      behavior: 'smooth',
      inline: 'center', // nearest
      block: 'nearest',
    });
  }

}
