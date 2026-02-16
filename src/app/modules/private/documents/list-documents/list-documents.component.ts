import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
import { DocumentService } from 'src/app/services/documents/documents.service';
import { DocumentInterface } from 'src/app/models/client.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { FeedbackFivestarsComponent } from 'src/app/shared/modals/feedback-fivestars/feedback-fivestars.component';
import { AlertService } from 'src/app/services/alert/alert.service';
import { ModalService } from 'src/app/services/modal/modal.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import ApexCharts, { ApexOptions } from 'apexcharts';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { FileViewerComponent } from 'src/app/shared/modals/file-viewer/file-viewer.component';
import { CommonModule } from '@angular/common';
import { TooltipComponent } from 'src/app/shared/components/tooltip/tooltip.component';
import { ModalEditDocumentComponent } from '../modal-edit-document/modal-edit-document.component';
import { DocumentConfig, DownloadService } from 'src/app/services/download/download.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CompliancePercentInterface, PercentInterface } from 'src/app/models/doc-percent.interface';
import { environment } from 'src/environments/environment';
import { CatalogService } from 'src/app/services/catalog/catalog.service';
import { DisclaimerFormComponent } from 'src/app/shared/modals/disclaimer-form/disclaimer-form.component';
import { DisclaimerService } from 'src/app/services/disclaimer/disclaimer.service';
import { Disclaimer } from 'src/app/models/disclaimer.interface';
import { catchError, finalize, map, Observable, of, ReplaySubject, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { PopoverComponent } from 'src/app/shared/components/popover/popover.component';
import { LoaderComponent } from 'src/app/shared/components/loader/loader.component';

@Component({
  selector: 'app-list-documents',
  standalone: true,
  imports: [CommonModule, PipesModule, ButtonComponent, TooltipComponent, PopoverComponent, LoaderComponent],
  templateUrl: './list-documents.component.html',
  styleUrl: './list-documents.component.scss'
})
export class ListDocumentsComponent implements OnInit, AfterViewInit, OnDestroy {

  user = this.eventManager.userLogged();
  clientSelected: any = this.eventManager.clientSelected();

  loading: boolean = false;
  loadingPercent: boolean = false;
  loadingDocs: boolean = false;
  loadManualDownload: boolean = false;

  percentData: CompliancePercentInterface | undefined;
  docList: any[] = [];
  citiesList: any[] = [];
  providerDisclaimer: Disclaimer | null = null;

  formatsBtnPopoverVisible: boolean = false;

  feedbackModalShown: boolean = false;
  disclaimerModalShown: boolean = false;
  dataformAlertShown: boolean = false;
  formatsBtnPopoverShown: boolean = false;

  chart!: ApexCharts;
  @ViewChild('donutChart', { static: false }) chartElement!: ElementRef;

  statusConfig: Record<string, { bg: string; text: string; icon: string; label: string }> = {
    'PENDIENTE': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'clock', label: 'Pendiente' },
    'AL DIA': { bg: 'bg-green-100', text: 'text-green-800', icon: 'check', label: 'Cargado' },
    'VENCIDO': { bg: 'bg-red-100', text: 'text-red-800', icon: 'close', label: 'Vencido' }
  };

  private downloadConfigs: Record<string, DocumentConfig> = {
    '8-9': {
      files: [
        { url: `${environment.s3AssetsHost}docs-prestadores-axa-gestion-preventiva.zip`, name: 'Documentos para diligenciar axa gestión preventiva.zip' }
      ],
      displayName: 'Documentos obligatorios a diligenciar',
    },
    '8-*': {
      files: [
        { url: `${environment.s3AssetsHost}docs-prestadores-axa.zip`, name: 'Documentos para diligenciar axa.zip' },
      ],
      displayName: 'Documentos obligatorios a diligenciar',
    },
    '13-7': {
      files: [
        { url: `${environment.s3AssetsHost}carta_mipres.pdf`, name: 'Carta_Mipres.pdf' }
      ],
      displayName: 'Carta Mipres a diligenciar',
    }
  };

  private destroy$ = new Subject<void>();
  private disclaimerReady$ = new ReplaySubject<void>(1);

  constructor(
    private eventManager: EventManagerService,
    private documentService: DocumentService,
    private router: Router,
    private modalService: ModalService,
    private alertService: AlertService,
    private downloadService: DownloadService,
    private toastService: ToastService,
    private catalogService: CatalogService,
    private disclaimerService: DisclaimerService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.getCities();
    this.getDocuments();

    this.loading = true;
    this.getProviderDisclaimer$()
      .pipe(
        switchMap(() => this.getDocumentPercent$()),
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(() => {
        this.disclaimerReady$.next();
      });
  }

  ngAfterViewInit(): void {
    this.disclaimerReady$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.startInitialModalsFlow();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCities() {
    this.catalogService.getCities().subscribe({
      next: (resp: any[]) => {
        this.citiesList = resp;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  getDocuments() {
    this.loadingDocs = true;
    const { idProvider, idClientHoneSolutions } = this.clientSelected;
    this.documentService.getDocuments(idProvider, idClientHoneSolutions).subscribe({
      next: (res: any) => {
        this.docList = res.data;
        this.loadingDocs = false;
      },
      error: (error: any) => {
        this.loadingDocs = false;
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

  getDocumentPercent$(): Observable<PercentInterface | null> {
    this.loadingPercent = true;

    const { idProvider, idClientHoneSolutions } = this.clientSelected;

    return this.documentService
      .getPercentDocuments(idProvider, idClientHoneSolutions)
      .pipe(
        map((res: any) => res.data as PercentInterface),

        // Efectos visuales / preparación
        tap((percentDataTypes: PercentInterface) => {
          this.percentData = percentDataTypes?.compliance;

          if (this.chart) {
            this.chart.updateSeries([
              this.percentData?.uploaded ?? 0,
              this.percentData?.remaining ?? 0,
              this.percentData?.expired ?? 0
            ]);
          } else {
            this.setupChart();
          }
        }),

        finalize(() => {
          this.loadingPercent = false;
        })
      );
  }

  getDocumentPercent(): void {
    this.loading = true;
    this.getDocumentPercent$()
      .pipe(finalize(() => this.loading = false))
      .subscribe(() => this.startInitialModalsFlow());
  }

  reloadDocuments(): void {
    this.getDocumentPercent();
    this.getDocuments();
  }

  setupChart(): void {
    const chartOptions = this.getChartOptions();
    this.chart = new ApexCharts(
      this.chartElement.nativeElement,
      chartOptions
    );
    this.chart.render();
  }
  getColor(variable: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  }
  getChartOptions(): ApexOptions {
    const {
      remaining = 100,
      uploaded = 0,
      expired = 0,
    } = this.percentData ?? {};

    return {
      series: [uploaded, remaining, expired],
      colors: [
        this.getColor('--color-green-500'),
        this.getColor('--color-yellow-400'),
        this.getColor('--color-red-500')
      ],
      chart: {
        height: 162,
        width: 162,
        type: 'donut'
      },
      stroke: {
        colors: ['transparent'],
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: '75%',
            labels: {
              show: true,
              name: {
                show: true,
                offsetY: 20,
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '14px'
              },
              value: {
                show: true,
                offsetY: -20,
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                fontSize: '16px',
                color: '#1e293b',
                formatter: function (value: string): string {
                  return value + '%';
                }
              },
            }
          }
        }
      },
      labels: ['Cargados', 'Pendientes', 'Vencidos'],
      dataLabels: {
        enabled: false
      },
      states: {
        hover: {
          filter: {
            type: 'lighten',
          }
        },
        active: {
          filter: {
            type: 'none',
          }
        }
      },
      legend: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
    };
  }
  highlightSeries(label: string): void {
    if (!this.chart) return;
    this.chart.toggleSeries(label);
    this.chart.highlightSeries(label);
  }
  clearHighlight(): void {
    if (!this.chart) return;
    this.chart.resetSeries();
  }

  /**
   * Entry point of the initial modal flow
   *
   * Sequential modal steps:
   * 1. Feedback
   * 2. Disclaimer
   * 3. Dataform alert
  */
  private startInitialModalsFlow(): void {
    if (
      this.percentData?.uploaded &&
      this.user.doesNeedSurvey &&
      !this.feedbackModalShown
    ) {
      this.open5starsFeedback();
      return;
    }

    this.openDisclaimerOrContinue();
  }

  private open5starsFeedback(): void {
    this.feedbackModalShown = true;
    const modal = this.modalService.open(FeedbackFivestarsComponent, {
      title: 'Nos gustaría conocer tu opinión',
      closable: false,
      customSize: 'max-w-[600px] !gap-2',
    });
    modal.onClose.subscribe((result) => {
      if (result?.submitted) {
        this.alertService.success(
          '¡Gracias por tu feedback!',
          'Tu opinión nos ayuda a mejorar.',
        ).subscribe(() => {
          this.openDisclaimerOrContinue();
        });
      } else {
        this.openDisclaimerOrContinue();
      }
    });
  }

  private openDisclaimerOrContinue(): void {
    if (this.providerDisclaimer && this.percentData?.uploaded === 100 && !this.disclaimerModalShown) {
      this.disclaimerModalShown = true;
      const modal = this.modalService.open(DisclaimerFormComponent, {
        title: 'Confirmación requerida',
        closable: false,
        customSize: 'max-w-[450px] !gap-2',
      }, {
        disclaimer: this.providerDisclaimer,
      });

      modal.onClose.subscribe(() => {
        this.showDataformAlert();
      });
      return;
    }

    this.showDataformAlert();
  }

  private showDataformAlert(): void {
    if (this.dataformAlertShown || (this.user.withData && !this.user.rejected)) {
      this.showFormatsBtnPopover();
      return;
    }
    this.dataformAlertShown = true;
    this.alertService.showAlert({
      title: '¡Atención!',
      message: this.user.withData
        ? 'Tu información no concuerda con lo guardado en base de datos, por favor revisa nuevamente el formulario.'
        : 'Recuerda actualizar tus datos garantizando así el cumplimiento total de tu gestión contractual.',
      closable: false,
      showConfirmBtn: true,
      confirmBtnText: 'Entendido',
    }).subscribe(() => {
      this.navigateTo('/update-data');
    });
  }

  showFormatsBtnPopover() {
    if (!this.getCurrentDownloadConfig() || this.formatsBtnPopoverShown) return;
    this.formatsBtnPopoverShown = true;
    this.formatsBtnPopoverVisible = true;
  }
  closeFormatsBtnPopover() {
    this.formatsBtnPopoverVisible = false;
  }

  navigateTo(url: string): void {
    this.router.navigate([url]);
  }

  viewFile(doc: DocumentInterface) {
    if (!doc.UrlDocument) return;

    const title = this.documentService.formatDocumentName(
      doc.typeDocument,
      doc.idDocumentType
    );

    this.modalService.open(FileViewerComponent, {
      closable: true,
      customSize: 'max-w-[800px] !gap-2',
    }, {
      title,
      url: doc.UrlDocument,
    });
  }

  deleteDocument(doc: any) {
    const { idDocumentsProvider } = doc;
    if (!this.clientSelected?.idProvider || !idDocumentsProvider) {
      this.toastService.error('Algo salió mal.');
      return;
    }

    this.alertService.confirmDelete(
      '¿Estas seguro de eliminar el documento?',
      'En caso de eliminar el documento se perderá y no podrá recuperarse'
    ).subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.loadingDocs = true;
      this.documentService.deleteDocument(this.clientSelected.idProvider, idDocumentsProvider).subscribe({
        next: (res: any) => {
          this.loadingDocs = false;
          this.reloadDocuments();
          this.alertService.success(
            '¡Documento eliminado!',
            'El documento se eliminó correctamente.'
          );
        },
        error: (error: any) => {
          this.loadingDocs = false;
          this.alertService.error(
            'Error',
            'Lo sentimos, no se pudo eliminar el documento.'
          );
        },
      });
    });
  }

  editDocumentModal(item: any, isNew: boolean = true): void {
    let docModalInputs: any = {
      currentDoc: item,
      citiesList: this.citiesList,
    };
    if (isNew) docModalInputs["isNew"] = true;

    const modal = this.modalService.open(ModalEditDocumentComponent, {
      title: isNew ? 'Agregar documento' : 'Actualizar información',
      customSize: 'max-w-[600px]',
    }, {
      ...docModalInputs,
    })
    modal.onClose.subscribe((result) => {
      if (result?.response) {
        this.reloadDocuments();
      }
    });
  }

  getCurrentDownloadConfig(): DocumentConfig | null {
    const clientId = this.clientSelected?.idClientHoneSolutions;
    const providerType = this.clientSelected?.idTypeProvider;
    if (!clientId || !providerType) return null;

    const keyExact = `${clientId}-${providerType}`;
    const keyWildcard = `${clientId}-*`;

    return this.downloadConfigs[keyExact] || this.downloadConfigs[keyWildcard] || null;
  }

  downloadClientDocs() {
    this.formatsBtnPopoverVisible = false;
    const config = this.getCurrentDownloadConfig();
    if (!config) return;

    let downloadsInProgress = config.files.length;
    this.loadManualDownload = true;
    config.files.forEach(doc => {
      this.downloadService.saveFile(doc.url, doc.name, () => {
        downloadsInProgress--;
        if (downloadsInProgress === 0) {
          this.loadManualDownload = false;
        }
      });
    });
  }

}
