import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, ElementRef, OnDestroy, OnInit, QueryList, signal, ViewChildren } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SERVICES_CONFIG, SERVICES_ORDER } from 'src/app/config/service-navigation.config';
import { clientServicesConfig, defaultServices } from 'src/app/config/client-services.config';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
import { NavigationService } from 'src/app/services/navigation/navigation.service';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';
import { BreadcrumbOption } from 'src/app/models/breadcrump';

@Component({
  selector: 'app-service-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, BreadcrumbComponent],
  templateUrl: './service-navigation.component.html',
  styleUrl: './service-navigation.component.scss'
})
export class ServiceNavigationComponent implements OnInit, AfterViewInit, OnDestroy {

  clientSelected: any = this.eventManager.clientSelected();

  serviceRoutes: any[] = [];
  currentLabel = signal<string>('');

  // It is recalculated when the used signals (clientSelected, currentLabel) change.
  breadcrumbSteps = computed<BreadcrumbOption[]>(() => [
    {
      label: 'Home',
      routerLink: '/home',
      iconHref: '/assets/icons/outline/general.svg#home',
      iconOnlyAsLabel: true,
    },
    { label: this.clientSelected?.clientHoneSolutions?.toUpperCase() || 'ASEGURADORA' },
    { label: this.currentLabel() }
  ]);

  private destroy$ = new Subject<void>();

  @ViewChildren('link') links!: QueryList<ElementRef<HTMLAnchorElement>>;

  constructor(
    private eventManager: EventManagerService,
    private navigationService: NavigationService,
  ) { }

  ngOnInit(): void {
    this.loadRoutes();

    this.navigationService.getCurrentUrl$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(url => {
        this.clientSelected = this.eventManager.clientSelected();
        this.setCurrentLabel(url ?? '');
      });
  }

  ngAfterViewInit(): void {
    this.scrollToActive();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadRoutes(): void {
    const clientId = this.clientSelected?.idClientHoneSolutions;
    const allowedKeys = clientServicesConfig[clientId] ?? defaultServices;

    this.serviceRoutes = SERVICES_ORDER
      .filter(key => allowedKeys.includes(key))
      .map(key => SERVICES_CONFIG[key]);
  }

  setCurrentLabel(currentUrl: string): void {
    const found = this.serviceRoutes.find(r => r.path === currentUrl);
    this.currentLabel.set(found ? found.label : '');
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
