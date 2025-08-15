import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgZorroModule } from '../../../../ng-zorro.module';
import { EventManagerService } from '../../../../services/events-manager/event-manager.service';
import { DocumentsCrudService } from '../../../../services/documents/documents-crud.service';
import { DocumentInterface } from '../../../../models/client.interface';
import { Router } from '@angular/router';
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
import { CitiesService } from 'src/app/services/cities/cities.service';
import { CompliancePercentInterface, PercentInterface } from 'src/app/models/doc-percent.interface';

@Component({
  selector: 'app-list-documents',
  standalone: true,
  imports: [NgZorroModule, CommonModule, PipesModule, ButtonComponent, TooltipComponent],
  templateUrl: './list-documents.component.html',
  styleUrl: './list-documents.component.scss'
})
export class ListDocumentsComponent implements OnInit {

  user = this.eventManager.userLogged();
  clientSelected: any = this.eventManager.clientSelected();
  loadingPercent: boolean = false;
  loadingDocs: boolean = false;
  loadManualDownload: boolean = false;

  percentData: CompliancePercentInterface | undefined;
  docList: any[] = [];
  citiesList: any[] = [];
  feedbackModalShown = false;
  dataformAlertShown = false;

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
        { url: 'https://honesolutions.blob.core.windows.net/documents/docs-prestadores-axa-gestion-preventiva.zip', name: 'Documentos para diligenciar axa gestión preventiva.zip' }
      ],
      displayName: 'Documentos obligatorios a diligenciar',
    },
    '8-*': {
      files: [
        { url: 'https://honesolutions.blob.core.windows.net/documents/docs-prestadores-axa.zip', name: 'Documentos para diligenciar axa.zip' },
      ],
      displayName: 'Documentos obligatorios a diligenciar',
    },
    '13-7': {
      files: [
        { url: 'https://honesolutions.blob.core.windows.net/documents/carta_mipres.pdf', name: 'Carta_Mipres.pdf' }
      ],
      displayName: 'Carta Mipres a diligenciar',
    }
  };

  constructor(
    private eventManager: EventManagerService,
    private documentService: DocumentsCrudService,
    private router: Router,
    private modalService: ModalService,
    private alertService: AlertService,
    private downloadService: DownloadService,
    private toastService: ToastService,
    private citiesService: CitiesService,
  ) { }

  ngOnInit(): void {
    this.getCities();
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

  getCities() {
    this.citiesService.getCities().subscribe({
      next: (resp: any[]) => {
        this.citiesList = resp;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  /**
   * Obtiene desde un api el porcentaje de documentos cargado, sin cargas y vencidos
   */
  getDocumentPercent() {
    this.loadingPercent = true;
    const { idProvider, idClientHoneSolutions } = this.clientSelected;
    this.documentService.getPercentDocuments(idProvider, idClientHoneSolutions).subscribe({
      next: (res: any) => {
        const percentDataTypes = res.data as PercentInterface;
        this.percentData = percentDataTypes?.compliance;
        this.loadingPercent = false;
        if (this.chart) {
          this.chart.updateSeries([
            this.percentData?.uploaded ?? 0,
            this.percentData?.remaining ?? 0,
            this.percentData?.expired ?? 0
          ]);
        } else {
          this.setupChart();
        }

        if (this.percentData?.uploaded && this.user.doesNeedSurvey && !this.feedbackModalShown) {
          this.open5starsFeedback();
        } else {
          this.showDataformAlert();
        }
      },
      error: (error: any) => {
        this.loadingPercent = false;
      },
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

  open5starsFeedback(): void {
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
          this.showDataformAlert();
        });
      } else {
        this.showDataformAlert();
      }
    });
  }

  showDataformAlert(): void {
    if (this.dataformAlertShown || (this.user.withData && !this.user.rejected)) {
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

  navigateTo(url: string): void {
    this.router.navigate([url]);
  }

  viewFile(doc: DocumentInterface) {
    if (doc.UrlDocument) {
      this.modalService.open(FileViewerComponent, {
        closable: true,
        customSize: 'max-w-[800px] !gap-2',
      }, {
        currentItem: doc,
      });
    }
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
          this.getDocumentPercent();
          this.getDocuments();
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
        this.getDocumentPercent();
        this.getDocuments();
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
