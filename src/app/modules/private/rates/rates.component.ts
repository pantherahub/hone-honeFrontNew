import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { DropdownTriggerDirective } from 'src/app/directives/dropdown-trigger.directive';
import { FileSelectDirective } from 'src/app/directives/file-select.directive';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { AlertService } from 'src/app/services/alert/alert.service';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
import { RateService } from 'src/app/services/rate/rate.service';
import { ButtonComponent } from 'src/app/shared/ui/buttons/button/button.component';
import { RateManagementComponent } from './rate-management/rate-management.component';
import { BadgeConfig } from 'src/app/types/badge-config.type';
import { catchError, finalize, Observable, of, ReplaySubject, Subject, takeUntil, tap } from 'rxjs';
import { DisclaimerService } from 'src/app/services/disclaimer/disclaimer.service';
import { ActivatedRoute } from '@angular/router';
import { Disclaimer } from 'src/app/interfaces/disclaimer.interface';
import { ModalService } from 'src/app/services/modal/modal.service';
import { DisclaimerFormComponent } from 'src/app/shared/overlays/modals/disclaimer-form/disclaimer-form.component';
import { LoaderComponent } from 'src/app/shared/ui/feedback/loader/loader.component';

@Component({
  selector: 'app-rates',
  standalone: true,
  imports: [CommonModule, PipesModule, ButtonComponent, DropdownTriggerDirective, FileSelectDirective, RateManagementComponent, LoaderComponent],
  templateUrl: './rates.component.html',
  styleUrl: './rates.component.scss'
})
export class RatesComponent implements OnInit, AfterViewInit, OnDestroy {

  user = this.eventManager.userLogged();
  clientSelected: any = this.eventManager.clientSelected();
  loading: boolean = false;

  providerDisclaimer: Disclaimer | null = null;

  loadingRates: boolean = false;
  rateList: any[] = [];

  statusConfig: Record<string, BadgeConfig> = {
    'APROBADO': {
      bgClass: 'bg-green-100',
      textClass: 'text-green-800',
      icon: 'check',
      label: 'Aprobado'
    },
    'RECHAZADO': {
      bgClass: 'bg-red-100',
      textClass: 'text-red-800',
      icon: 'close',
      label: 'Rechazado'
    },
    'EN PROCESO': {
      bgClass: 'bg-yellow-100',
      textClass: 'text-yellow-800',
      icon: 'clock',
      label: 'En proceso'
    },
    'PENDIENTE POR CARGAR': {
      bgClass: 'bg-blue-100',
      textClass: 'text-blue-800',
      label: 'Pendiente por cargar'
    },
  };

  selectedRate: any = null;
  isRateDrawerOpen: boolean = false;
  initialFile: File | null = null;

  isMobile: boolean = window.innerWidth < 640;

  private destroy$ = new Subject<void>();
  private disclaimerReady$ = new ReplaySubject<void>(1);

  constructor(
    private eventManager: EventManagerService,
    private alertService: AlertService,
    private rateService: RateService,
    private disclaimerService: DisclaimerService,
    private route: ActivatedRoute,
    private modalService: ModalService,
  ) { }

  ngOnInit(): void {
    this.getRates();

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

  getRates() {
    this.loadingRates = true;
    const { idProvider, idClientHoneSolutions } = this.clientSelected;
    this.rateService.getRates(idProvider, idClientHoneSolutions).subscribe({
      next: (res: any) => {
        this.rateList = res.data;
        this.loadingRates = false;
      },
      error: (error: any) => {
        this.loadingRates = false;
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

  getRateStatus(rate: any): string {
    if (!rate) return 'PENDIENTE POR CARGAR';
    return rate.rateStatus;
  }

  triggerFileTableInput(input: HTMLInputElement) {
    input.value = '';
    input.click();
  }

  uploadRateFile(uploadedFile: any, rate: any) {
    const file = uploadedFile as File;
    if (!file) return;

    if (this.getRateStatus(rate.currentRate) === 'PENDIENTE POR CARGAR') {
      if (this.isRateDrawerOpen) return;
      this.initialFile = file;
      this.openRateDetail(rate);
    } else {
      this.onSubmitRate(file, rate);
    }
  }

  openRateDetail(rate: any) {
    if (!rate) return;
    this.selectedRate = rate;
    this.isRateDrawerOpen = true;
  }

  onDrawerOpenChange(open: boolean) {
    this.isRateDrawerOpen = open;
    if (!open) this.onDrawerClose();
  }

  onDrawerClose() {
    this.selectedRate = null;
    this.initialFile = null;
  }

  onSubmitRate(file: File, rate: any) {
    if (!file || !rate) return;

    const reqData = new FormData();
    reqData.append('archivo', file, file.name);
    // this.rateService.uploadRate(formData).subscribe({
    //   next: (res) => {
    //   },
    //   error: (err) => {
    //     console.error(err);
    //   }
    // });
  }

  deleteRate(rate: any) {
    this.alertService.confirmDelete(
      '¿Estas seguro de eliminar la tarifa?',
      'En caso de eliminar la tarifa se perderá y no podrá recuperarse'
    ).subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      // this.rateService.deleteRate(formData).subscribe({
      //   next: (res) => {
      //   },
      //   error: (err) => {
      //     console.error(err);
      //   }
      // });
      this.alertService.success(
        '¡Tarifa eliminada!',
        'La tarifa se eliminó correctamente.'
      );
      // this.alertService.error(
      //   'Error',
      //   'Lo sentimos, no se pudo eliminar la tarifa.'
      // );
    });
  }

}
