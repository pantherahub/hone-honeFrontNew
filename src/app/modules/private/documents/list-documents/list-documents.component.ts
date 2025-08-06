import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, effect } from '@angular/core';
import { NgZorroModule } from '../../../../ng-zorro.module';
import { EventManagerService } from '../../../../services/events-manager/event-manager.service';
import { DocumentsCrudService } from '../../../../services/documents/documents-crud.service';
import { DocumentInterface, PercentInterface } from '../../../../models/client.interface';
import { RemainingDocumentsComponent } from '../remaining-documents/remaining-documents.component';
import { ExpiredDocumentsComponent } from '../expired-documents/expired-documents.component';
import { UploadedDocumentsComponent } from '../uploaded-documents/uploaded-documents.component';
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

interface DocumentConfig {
  files: { url: string; name: string }[]; // pueden ser .pdf o .zip
  displayName: string; // nombre para el botón o mensaje
}

@Component({
  selector: 'app-list-documents',
  standalone: true,
  imports: [NgZorroModule, CommonModule, PipesModule, FileViewerComponent, RemainingDocumentsComponent, ExpiredDocumentsComponent, UploadedDocumentsComponent, ButtonComponent, TooltipComponent],
  templateUrl: './list-documents.component.html',
  styleUrl: './list-documents.component.scss'
})
export class ListDocumentsComponent implements OnInit {

  user = this.eventManager.userLogged();
  clientSelected: any = this.eventManager.clientSelected();
  loadingPercent: boolean = false;
  loadingDocs: boolean = false;
  loadManualDownload: boolean = false;

  percentData: PercentInterface = {};
  feedbackModalShown = false;
  dataformAlertShown = false;

  docList: any[] = [];

  testItems: any[] = Array(4);
  @ViewChild('donutChart', { static: false }) chartElement!: ElementRef;
  chart!: ApexCharts;

  constructor(
    private eventManager: EventManagerService,
    private documentService: DocumentsCrudService,
    private router: Router,
    private modalService: ModalService,
    private alertService: AlertService,
  ) {
    // effect(
    //   () => {
    //     const shouldCallApi = this.eventManager.getPercentApi();
    //     if (shouldCallApi) {
    //       this.getDocumentPercent();
    //       // Reset to avoid double querying with ngOnInit when re-rendering the component
    //       this.eventManager.getPercentApi.set(0);
    //     }
    //   }, { allowSignalWrites: true }
    // );
  }

  ngOnInit(): void {
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
    } = this.percentData;

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
    this.chart.resetSeries();
  }

  /**
   * Obtiene desde un api el porcentaje de documentos cargado, sin cargas y vencidos
   */
  getDocumentPercent() {
    this.loadingPercent = true;
    const { idProvider, idTypeProvider, idClientHoneSolutions } = this.clientSelected;
    this.documentService.getPercentDocuments(idProvider, idTypeProvider, idClientHoneSolutions).subscribe({
      next: (res: any) => {
        this.percentData = res.data;
        this.loadingPercent = false;
        if (this.chart) {
          this.chart.updateSeries([
            this.percentData.uploaded ?? 0,
            this.percentData.remaining ?? 0,
            this.percentData.expired ?? 0
          ]);
        } else {
          this.setupChart();
        }

        if (this.percentData.uploaded && this.user.doesNeedSurvey && !this.feedbackModalShown) {
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
    })
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

    this.alertService.confirmDelete(
      '¿Estas seguro de eliminar el documento?',
      'En caso de eliminar el documento se perderá y no podrá recuperarse'
    ).subscribe((confirmed: boolean) => {
      console.log("confirmed", confirmed);
      if (!confirmed) return;
      this.loadingDocs = true;
      this.documentService.deleteDocument(idDocumentsProvider).subscribe({
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






  private downloadConfigs: Record<string, DocumentConfig> = {
    '8-9': {
      files: [
        { url: 'assets/documents-provider/documentos-axa-gestion-preventiva.zip', name: 'Documentos para diligenciar axa gestión preventiva.zip' }
      ],
      displayName: 'Documentos obligatorios a diligenciar',
    },
    '8-*': {
      files: [
        { url: 'assets/documents-provider/documentos-axa.zip', name: 'Documentos para diligenciar axa.zip' },
        {
          url: 'https://honesolutions.blob.core.windows.net/documents/PresentacionInduccionSostenibilidad2025.pdf',
          name: 'Presentación inducción y sostenibilidad 2025.pdf'
        },
        {
          url: 'https://honesolutions.blob.core.windows.net/documents/Manual_Portal_de_Prestadores_Salud_VF_2.pdf',
          name: 'Manual Portal de Prestadores Salud VF 2.pdf'
        },
        {
          url: 'https://honesolutions.blob.core.windows.net/documents/AXA_Manual_Radicacion_Digital_Salud_1.30.25_(2275+2284).pdf',
          name: 'AXA Manual Radicacion Digital Salud 1.30.25 (2275+2284).pdf'
        },
      ],
      displayName: 'Documentos obligatorios a diligenciar y manuales',
    },
    '13-7': {
      files: [
        { url: 'assets/documents-provider/CartaMipres.pdf', name: 'Carta_Mipres.pdf' }
      ],
      displayName: 'Carta Mipres a diligenciar',
    }
  };






  downloadClientDocs() {
    switch (this.clientSelected.idClientHoneSolutions) {
      case (8): // axa
        if (this.clientSelected.idTypeProvider == 9) {
          // Este zip:
          this.saveAs(
            `assets/documents-provider/documentos-axa-gestion-preventiva.zip`,
            `Documentos para diligenciar axa gestión preventiva.zip`
          );
          const documents = [
            {
              url: 'https://honesolutions.blob.core.windows.net/documents/PresentacionInduccionSostenibilidad2025.pdf',
              name: 'Presentación inducción y sostenibilidad 2025.pdf'
            },
            {
              url: 'https://honesolutions.blob.core.windows.net/documents/Manual_Portal_de_Prestadores_Salud_VF_2.pdf',
              name: 'Manual Portal de Prestadores Salud VF 2.pdf'
            },
            {
              url: 'https://honesolutions.blob.core.windows.net/documents/AXA_Manual_Radicacion_Digital_Salud_1.30.25_(2275+2284).pdf',
              name: 'AXA Manual Radicacion Digital Salud 1.30.25 (2275+2284).pdf'
            },
          ];
          break;
        } else {
          // Un solo zip con todo esto: (tanto el zip del saveAs como los documentos pdf, todo eso en un zip)
          this.saveAs(
            `assets/documents-provider/documentos-axa.zip`,
            `Documentos para diligenciar axa.zip`
          );
          const documents = [
            {
              url: 'https://honesolutions.blob.core.windows.net/documents/PresentacionInduccionSostenibilidad2025.pdf',
              name: 'Presentación inducción y sostenibilidad 2025.pdf'
            },
            {
              url: 'https://honesolutions.blob.core.windows.net/documents/Manual_Portal_de_Prestadores_Salud_VF_2.pdf',
              name: 'Manual Portal de Prestadores Salud VF 2.pdf'
            },
            {
              url: 'https://honesolutions.blob.core.windows.net/documents/AXA_Manual_Radicacion_Digital_Salud_1.30.25_(2275+2284).pdf',
              name: 'AXA Manual Radicacion Digital Salud 1.30.25 (2275+2284).pdf'
            },
          ];
        }
        break;
      case (13):
        if (this.clientSelected.idTypeProvider == 7) {
          // Solo este documento (no zip)
          this.saveAs(`assets/documents-provider/CartaMipres.pdf`, `Carta_Mipres.pdf`);
          break;
        }

    }
  }

  /**
   * Valida el tipo de prestador y descarga un paquete de documentos
   */
  downloadDocumentsAxa() { // YA
    if (this.clientSelected.idTypeProvider == 9) {
      this.saveAs(
        `assets/documents-provider/documentos-axa-gestion-preventiva.zip`,
        `Documentos para diligenciar axa gestión preventiva.zip`
      );
      return;
    }
    this.saveAs(
      `assets/documents-provider/documentos-axa.zip`,
      `Documentos para diligenciar axa.zip`
    );
  }

  /**
   * Descargar para Axa manuales de prestadores de Servicios de Salud
   */
  downloadAxaProviderManual() {
    if (this.loadManualDownload) return;
    const documents = [
      {
        url: 'https://honesolutions.blob.core.windows.net/documents/PresentacionInduccionSostenibilidad2025.pdf',
        name: 'Presentación inducción y sostenibilidad 2025.pdf'
      },
      {
        url: 'https://honesolutions.blob.core.windows.net/documents/Manual_Portal_de_Prestadores_Salud_VF_2.pdf',
        name: 'Manual Portal de Prestadores Salud VF 2.pdf'
      },
      {
        url: 'https://honesolutions.blob.core.windows.net/documents/AXA_Manual_Radicacion_Digital_Salud_1.30.25_(2275+2284).pdf',
        name: 'AXA Manual Radicacion Digital Salud 1.30.25 (2275+2284).pdf'
      },
    ];

    let downloadsInProgress = documents.length;
    this.loadManualDownload = true;
    documents.forEach(doc => {
      this.saveAs(doc.url, doc.name, () => {
        downloadsInProgress--;
        if (downloadsInProgress === 0) {
          this.loadManualDownload = false;
        }
      });
    });
  }

  /**
   * Descarga Documentos de Sura
   */
  downloadDocumentsSura() {
    // Natural person
    if (this.clientSelected.idTypeProvider == 7) {
      this.saveAs(`assets/documents-provider/CartaMipres.pdf`, `Carta_Mipres.pdf`);
    }
  }

  /**
   * Recibe la url de donde se toman los documentos locales y los descarga
   * @param url - ruta de los assets/container a descargar
   * @param name - nombre del archivo que se muestra en la descarga
   * @param onComplete - callback opcional para cuando se complete la descarga
   */
  saveAs(url: any, name: any, onComplete?: () => void) {
    if (url.startsWith('http')) {
      fetch(url)
        .then(response => {
          if (!response.ok) throw new Error('Error al descargar el archivo');
          return response.blob();
        })
        .then(blob => {
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = name;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(blobUrl);
        })
        .catch(error => console.error('Error descargando el archivo:', error))
        .finally(() => {
          if (onComplete) onComplete();
        });
      return;
    }

    const link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    if (onComplete) onComplete();
  }

}
