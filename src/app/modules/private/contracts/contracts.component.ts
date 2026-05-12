import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, finalize, Observable, of, ReplaySubject, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { Disclaimer } from 'src/app/interfaces/disclaimer.interface';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { ContractService } from 'src/app/services/contract/contract.service';
import { DisclaimerService } from 'src/app/services/disclaimer/disclaimer.service';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
import { ModalService } from 'src/app/services/modal/modal.service';
import { ButtonComponent } from 'src/app/shared/ui/buttons/button/button.component';
import { TextInputComponent } from 'src/app/shared/ui/forms/text-input/text-input.component';
import { DisclaimerFormComponent } from 'src/app/shared/overlays/modals/disclaimer-form/disclaimer-form.component';
import { BadgeConfig } from 'src/app/types/badge-config.type';
import { ContractFiltersComponent } from './contract-filters/contract-filters.component';
import { TicketService } from 'src/app/services/ticket/ticket.service';
import { LoaderComponent } from 'src/app/shared/ui/feedback/loader/loader.component';
import { TicketStatus } from 'src/app/interfaces/ticket.interface';
import { Contract, ContractFilters } from 'src/app/interfaces/contract.interface';
import { ToastService } from 'src/app/services/toast/toast.service';
import { PaginationComponent } from 'src/app/shared/ui/feedback/pagination/pagination.component';
import { FilterButtonComponent } from 'src/app/shared/ui/buttons/filter-button/filter-button.component';
import { TicketDetailComponent } from 'src/app/shared/overlays/drawers/ticket-detail/ticket-detail.component';

@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PipesModule, ButtonComponent, TextInputComponent, ContractFiltersComponent, LoaderComponent, PaginationComponent, FilterButtonComponent, TicketDetailComponent],
  templateUrl: './contracts.component.html',
  styleUrl: './contracts.component.scss'
})
export class ContractsComponent implements OnInit, AfterViewInit, OnDestroy {

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
      label: 'Aprobado'
    },
    'RECHAZADO': {
      bgClass: 'bg-red-100',
      textClass: 'text-red-800',
      icon: 'close',
      label: 'Anulado'
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
  appliedFiltersValue: Partial<ContractFilters> = {};

  totalItems: number = 0;
  itemsPerPage: number = 5;
  currentPage: number = 1;

  loadingContracts: boolean = false;
  contractList: Contract[] = [];
  private loadContracts$ = new Subject<ContractFilters>();

  private destroy$ = new Subject<void>();
  private disclaimerReady$ = new ReplaySubject<void>(1);

  @ViewChild('filterDrawer', { static: false }) filterDrawer!: ContractFiltersComponent;
  @ViewChild('ticketDrawer', { static: false }) ticketDrawer!: TicketDetailComponent;

  constructor(
    private eventManager: EventManagerService,
    private contractService: ContractService,
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
    this.loadContracts();

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
      expedientNumber: [''],
      startDate: [null],
      endDate: [null],
      idStatus: [null],
    });

    this.appliedFiltersValue = this.filterForm.value;

    // Searcher field
    this.filterForm.get('expedientNumber')?.valueChanges
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
    const { expedientNumber, startDate, endDate, idStatus } = this.appliedFiltersValue;
    let count = 0;

    if (expedientNumber?.trim()) count++;
    if (startDate && endDate === '') count++;
    if (idStatus != null) count++;

    return count;
  }

  private initDataStream() {
    this.loadContracts$.pipe(
      takeUntil(this.destroy$),
      switchMap((payload) => {
        this.loadingContracts = true;
        return this.contractService.getContracts(payload).pipe(
          catchError((err: any) => {
            const errorData = err.error;
            if (err.status === 404 && errorData) {
              return of(errorData);
            }
            console.error(err);
            this.toastService.error('Algo salió mal.');
            return of({ data: [], currentPage: 1, totalItems: 0 });
          }),
          finalize(() => this.loadingContracts = false)
        );
      }),
    ).subscribe({
      next: (res: any) => {
        if (!res) return;
        this.contractList = res.data;
        this.currentPage = res.currentPage;
        this.totalItems = res.totalItems;
      }
    });
  }

  getTicketStatusList() {
    this.ticketService.getTicketStatus().subscribe({
      next: (res: any) => {
        // Filter status list by contract status config
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

  getContractStatus(contract: Contract): string {
    const contractStatus = contract.Ticket?.Status?.status;
    if (!contractStatus) return 'PENDIENTE';

    const config = this.statusConfig[contractStatus];
    if (!config) return 'EN TRAMITE';
    return contractStatus;
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
    filterData.expedientNumber = filterData.expedientNumber?.trim() || null;

    this.appliedFiltersValue = filterData;
    this.currentPage = 1;
    this.loadContracts();
  }

  loadContracts() {
    const params = this.appliedFiltersValue;
    const { idProvider, idClientHoneSolutions, identificacion } = this.clientSelected;
    const payload: ContractFilters = {
      idProvider,
      idClientHoneSolutions,
      identification: identificacion,
      page: this.currentPage,
      limit: this.itemsPerPage,
      ...params,
    };
    this.loadContracts$.next(payload);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadContracts();
  }

  openContractModal(idTicket: number) {
    this.ticketDrawer.open(idTicket);
  }

}
