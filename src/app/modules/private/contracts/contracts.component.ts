import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, finalize, Observable, of, ReplaySubject, Subject, takeUntil, tap } from 'rxjs';
import { DropdownTriggerDirective } from 'src/app/directives/dropdown-trigger.directive';
import { FileSelectDirective } from 'src/app/directives/file-select.directive';
import { Disclaimer } from 'src/app/interfaces/disclaimer.interface';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { AlertService } from 'src/app/services/alert/alert.service';
import { ContractService } from 'src/app/services/contract/contract.service';
import { DisclaimerService } from 'src/app/services/disclaimer/disclaimer.service';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
import { ModalService } from 'src/app/services/modal/modal.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { DisclaimerFormComponent } from 'src/app/shared/modals/disclaimer-form/disclaimer-form.component';
import { BadgeConfig } from 'src/app/types/badge-config.type';

@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [CommonModule, PipesModule, ButtonComponent, DropdownTriggerDirective, FileSelectDirective],
  templateUrl: './contracts.component.html',
  styleUrl: './contracts.component.scss'
})
export class ContractsComponent implements OnInit, AfterViewInit, OnDestroy {

  user = this.eventManager.userLogged();
  clientSelected: any = this.eventManager.clientSelected();
  loading: boolean = false;

  providerDisclaimer: Disclaimer | null = null;

  statusConfig: Record<string, BadgeConfig> = {
    'APROBADO': {
      bgClass: 'bg-green-100',
      textClass: 'text-green-800',
      icon: 'check',
      label: 'Aprobado'
    },
    'ANULADO': {
      bgClass: 'bg-red-100',
      textClass: 'text-red-800',
      icon: 'close',
      label: 'Anulado'
    },
    'OBJECION': {
      bgClass: 'bg-yellow-100',
      textClass: 'text-yellow-800',
      icon: 'clock',
      label: 'Con objeción'
    },
    'PENDIENTE': {
      bgClass: 'bg-blue-100',
      textClass: 'text-blue-800',
      label: 'Pendiente'
    },
  };

  loadingContracts: boolean = false;
  contractList: any[] = [];
  selectedContract: any = null;

  private destroy$ = new Subject<void>();
  private disclaimerReady$ = new ReplaySubject<void>(1);

  constructor(
    private eventManager: EventManagerService,
    private alertService: AlertService,
    private contractService: ContractService,
    private disclaimerService: DisclaimerService,
    private route: ActivatedRoute,
    private modalService: ModalService,
  ) { }

  ngOnInit(): void {
    this.getContracts();

    this.loading = true;
    this.getProviderDisclaimer$()
      .pipe(finalize(() => this.loading = false))
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

  getContracts() {
    this.loadingContracts = true;
    const { idProvider, idClientHoneSolutions } = this.clientSelected;
    this.contractService.getContracts(idProvider, idClientHoneSolutions).subscribe({
      next: (res: any) => {
        this.contractList = res.data;
        this.loadingContracts = false;
      },
      error: (error: any) => {
        this.loadingContracts = false;
      },
    });
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

  openContractDetail(contract: any) { }

}
