import { Component, OnInit, effect } from '@angular/core';
import { NgZorroModule } from '../../../../ng-zorro.module';
import { EventManagerService } from '../../../../services/events-manager/event-manager.service';
import { DocumentsCrudService } from '../../../../services/documents/documents-crud.service';
import { PercentInterface } from '../../../../models/client.interface';
import { RemainingDocumentsComponent } from '../remaining-documents/remaining-documents.component';
import { ExpiredDocumentsComponent } from '../expired-documents/expired-documents.component';
import { UploadedDocumentsComponent } from '../uploaded-documents/uploaded-documents.component';
import { Router } from '@angular/router';
import { FeedbackFivestarsComponent } from 'src/app/shared/modals/feedback-fivestars/feedback-fivestars.component';
import { AlertService } from 'src/app/services/alert/alert.service';
import { ModalService } from 'src/app/services/modal/modal.service';

@Component({
  selector: 'app-list-documents',
  standalone: true,
  imports: [NgZorroModule, RemainingDocumentsComponent, ExpiredDocumentsComponent, UploadedDocumentsComponent],
  templateUrl: './list-documents.component.html',
  styleUrl: './list-documents.component.scss'
})
export class ListDocumentsComponent implements OnInit {

  user = this.eventManager.userLogged();
  clientSelected: any = this.eventManager.clientSelected();
  loadingData: boolean = false;
  loadManualDownload: boolean = false;

  percentData: PercentInterface = {};
  feedbackModalShown = false;
  dataformAlertShown = false;

  constructor(
    private eventManager: EventManagerService,
    private documentService: DocumentsCrudService,
    private router: Router,
    private modalService: ModalService,
    private alertService: AlertService,
  ) {
    effect(
      () => {
        const shouldCallApi = this.eventManager.getPercentApi();
        if (shouldCallApi) {
          this.getDocumentPercent();
          // Reset to avoid double querying with ngOnInit when re-rendering the component
          this.eventManager.getPercentApi.set(0);
        }
      }, { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    this.getDocumentPercent();
  }


  /**
  * Cambia el titulo de la pagina de autogestion por el nombre que obtenga del tab seleccionado
  * inicialmente el titulo es MI PERFIL
  * recibe un arreglo de eventos, en el cual esta el index y la informacion del tab
  * @params event: any
  */
  tabChange(event: any) { }

  /**
   * Obtiene desde un api el porcentaje de documentos cargado, sin cargas y vencidos
   */
  getDocumentPercent() {
    this.loadingData = true;
    const { idProvider, idTypeProvider, idClientHoneSolutions } = this.clientSelected;
    this.documentService.getPercentDocuments(idProvider, idTypeProvider, idClientHoneSolutions).subscribe({
      next: (res: any) => {
        this.percentData = res;
        this.loadingData = false;

        if (this.percentData.uploaded && this.user.doesNeedSurvey && !this.feedbackModalShown) {
          this.open5starsFeedback();
        } else {
          this.showDataformAlert();
        }
      },
      error: (error: any) => {
        this.loadingData = false;
      },
      complete: () => { }
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

  /**
   * Valida el tipo de prestador y descarga un paquete de documentos
   */
  downloadDocumentsAxa() {
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
   * Valida el tipo de prestador y descarga un paquete de documentos de mundial de seguros
   */
  downloadDocumentsMundialSeguros() {
    this.saveAs(`assets/documents-provider/SARLAFT.zip`, `Documentos para diligenciar SARLAFT.zip`);
  }

  /**
   * Valida el tipo de prestador y descarga un paquete de documentos de mundial de seguros
   */
  downloadDocumentsMundialSegurosInformative() {
    this.saveAs(`assets/documents-provider/documentos-informativos-seguros-mundial.zip`, `Documentos informativos documentos-informativos-seguros-mundial.zip`);
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
