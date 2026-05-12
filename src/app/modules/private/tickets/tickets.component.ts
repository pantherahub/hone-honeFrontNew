import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, finalize, Observable, of, ReplaySubject, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { Disclaimer } from 'src/app/interfaces/disclaimer.interface';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { DisclaimerService } from 'src/app/services/disclaimer/disclaimer.service';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
import { ModalService } from 'src/app/services/modal/modal.service';
import { ButtonComponent } from 'src/app/shared/ui/buttons/button/button.component';
import { TextInputComponent } from 'src/app/shared/ui/forms/text-input/text-input.component';
import { DisclaimerFormComponent } from 'src/app/shared/overlays/modals/disclaimer-form/disclaimer-form.component';
import { BadgeConfig } from 'src/app/types/badge-config.type';
import { TicketService } from 'src/app/services/ticket/ticket.service';
import { LoaderComponent } from 'src/app/shared/ui/feedback/loader/loader.component';
import { Ticket, TicketFilters, TicketStatus } from 'src/app/interfaces/ticket.interface';
import { ToastService } from 'src/app/services/toast/toast.service';
import { PaginationComponent } from 'src/app/shared/ui/feedback/pagination/pagination.component';
import { TicketFiltersComponent } from './ticket-filters/ticket-filters.component';
import { TicketDetailComponent } from 'src/app/shared/overlays/drawers/ticket-detail/ticket-detail.component';
import { NavigationService } from 'src/app/services/navigation/navigation.service';
import { FilterButtonComponent } from 'src/app/shared/ui/buttons/filter-button/filter-button.component';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PipesModule, ButtonComponent, TextInputComponent, TicketFiltersComponent, LoaderComponent, PaginationComponent, FilterButtonComponent, TicketDetailComponent],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.scss'
})
export class TicketsComponent implements OnInit, AfterViewInit, OnDestroy {

  user = this.eventManager.userLogged();
  clientSelected: any = this.eventManager.clientSelected();
  loading: boolean = false;

  providerDisclaimer: Disclaimer | null = null;

  statusList: TicketStatus[] = [];
  statusConfig: Record<string, BadgeConfig> = {
    'GESTIONADO': {
      bgClass: 'bg-green-100',
      textClass: 'text-green-800',
      icon: 'check',
      label: 'Gestionado'
    },
    'RECHAZADO': {
      bgClass: 'bg-red-100',
      textClass: 'text-red-800',
      icon: 'close',
      label: 'Rechazado'
    },
    'EN TRAMITE': {
      bgClass: 'bg-yellow-100',
      textClass: 'text-yellow-800',
      icon: 'clock',
      label: 'En trámite'
    },
    'PENDIENTE': {
      bgClass: 'bg-gray-100',
      textClass: 'text-gray-900',
      icon: 'cloud-arrow-up',
      label: 'Pendiente'
    },
  };

  filterForm!: FormGroup;
  appliedFiltersValue: Partial<TicketFilters> = {};

  totalItems: number = 0;
  itemsPerPage: number = 5;
  currentPage: number = 1;

  loadingTickets: boolean = false;
  ticketList: Ticket[] = [];
  private loadTickets$ = new Subject<TicketFilters>();

  private destroy$ = new Subject<void>();
  private disclaimerReady$ = new ReplaySubject<void>(1);

  @ViewChild('filterDrawer', { static: false }) filterDrawer!: TicketFiltersComponent;
  @ViewChild('ticketDrawer', { static: false }) ticketDrawer!: TicketDetailComponent;

  constructor(
    private eventManager: EventManagerService,
    private navigationService: NavigationService,
    private router: Router,
    private disclaimerService: DisclaimerService,
    private route: ActivatedRoute,
    private modalService: ModalService,
    private fb: FormBuilder,
    private ticketService: TicketService,
    private toastService: ToastService,
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.initDataStream();
    this.getTicketStatusList();
    this.loadTickets();

    this.loading = true;
    this.getProviderDisclaimer$()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe(() => {
        this.disclaimerReady$.next();
      });
  }

  ngAfterViewInit(): void {
    this.disclaimerReady$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.openDisclaimer();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack() {
    // const backRoute = this.navigationService.getBackRoute();
    // this.router.navigateByUrl(backRoute);
    this.router.navigateByUrl('support', { replaceUrl: true });
  }

  private getProviderDisclaimer$(): Observable<void> {
    const { idProvider, idClientHoneSolutions } = this.clientSelected;
    const disclaimerKey = this.route.snapshot.data['disclaimerKey'];

    return this.disclaimerService
      .getDisclaimer(disclaimerKey, idProvider, idClientHoneSolutions)
      .pipe(
        tap((resp: any) => {
          const data = resp?.data;
          this.providerDisclaimer =
            data?.canRespond && data?.disclaimer
              ? data.disclaimer
              : null;
        }),
        catchError(err => {
          if (err.status !== 404) console.error(err);
          this.providerDisclaimer = null;
          return of(void 0);
        })
      );
  }

  private openDisclaimer(): void {
    if (!this.providerDisclaimer) return;

    this.modalService.open(DisclaimerFormComponent, {
      title: 'Confirmación requerida',
      closable: false,
      customSize: 'max-w-[450px] !gap-2',
    }, {
      disclaimer: this.providerDisclaimer,
    });
  }

  initForm() {
    this.filterForm = this.fb.group({
      idTicket: [null],
      requestName: [null],
      startDate: [null],
      endDate: [null],
      idStatus: [null],
    });

    this.appliedFiltersValue = this.filterForm.value;

    // Searcher field
    this.filterForm.get('idTicket')?.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.applyFilters();
      });
  }

  get appliedFiltersCount(): number {
    const { idTicket, requestName, startDate, endDate, idStatus } = this.appliedFiltersValue;
    let count = 0;

    if (idTicket) count++;
    if (requestName?.trim()) count++;
    if (startDate && endDate === '') count++;
    if (idStatus != null) count++;

    return count;
  }

  private initDataStream() {
    this.loadTickets$.pipe(
      takeUntil(this.destroy$),
      switchMap((payload) => {
        this.loadingTickets = true;
        return this.ticketService.getTickets(payload).pipe(
          catchError((err: any) => {
            const errorData = err.error;
            if (err.status === 404 && errorData) {
              return of(errorData);
            }
            console.error(err);
            this.toastService.error('Algo salió mal.');
            return of({ data: [], currentPage: 1, totalItems: 0 });
          }),
          finalize(() => this.loadingTickets = false)
        );
      }),
    ).subscribe({
      next: (res: any) => {
        if (!res) return;
        this.ticketList = res.data;
        this.currentPage = res.currentPage;
        this.totalItems = res.totalItems;
      }
    });
  }

  getTicketStatusList() {
    this.ticketService.getTicketStatus().subscribe({
      next: (res: any) => {
        // Filter status list by ticket status config
        const allowedKeys = Object.keys(this.statusConfig);
        this.statusList = res.filter((item: TicketStatus) =>
          allowedKeys.includes(item.status)
        );
      },
      error: (err: any) => {
        console.error('Error fetching ticket status list:', err);
      }
    });
  }

  getTicketStatus(ticket: Ticket): string {
    const ticketStatus = ticket?.Status?.status;
    if (!ticketStatus) return 'PENDIENTE';

    const config = this.statusConfig[ticketStatus];
    if (!config) return 'EN TRAMITE';
    return ticketStatus;
  }

  openFiltersModal() {
    this.filterDrawer.open(this.appliedFiltersValue);
  }

  onFilterDrawerClose(newFilters?: any) {
    if (!newFilters) return;
    this.filterForm.patchValue(newFilters, { emitEvent: false });
    this.applyFilters();
  }

  clearFilters() {
    this.filterForm.reset({}, { emitEvent: false });
    this.applyFilters();
  }

  applyFilters() {
    let filterData = this.filterForm.value;
    filterData.idTicket = filterData.idTicket || null;
    filterData.requestName = filterData.requestName?.trim() || null;

    this.appliedFiltersValue = filterData;
    this.currentPage = 1;
    this.loadTickets();
  }

  loadTickets() {
    const params = this.appliedFiltersValue;
    const payload: TicketFilters = {
      page: this.currentPage,
      limit: this.itemsPerPage,

      // idProvider: this.user.id,
      idProviderCreator: this.user.id,
      messageOptions: {
        withMessages: false,
      },
      isNew: true,
      ...params,
    };
    this.loadTickets$.next(payload);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadTickets();
  }

  openTicketModal(idTicket: number) {
    this.ticketDrawer.open(idTicket);
  }

}
