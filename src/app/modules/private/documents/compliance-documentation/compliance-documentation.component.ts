import { Component, OnInit, effect } from '@angular/core';
import { NgZorroModule } from '../../../../ng-zorro.module';
import { Router } from '@angular/router';
import { EventManagerService } from '../../../../services/events-manager/event-manager.service';
import { PercentInterface } from '../../../../models/client.interface';
import { DocumentsCrudService } from '../../../../services/documents/documents-crud.service';
import { ProviderAsisstService } from '../../../../services/assist-provider/provider-asisst.service';
import { GetAssistanceProvider } from '../../../../models/assistance-provider.interface';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ProviderAssistanceComponent } from '../../../../shared/modals/provider-assistance/provider-assistance.component';

@Component({
  selector: 'app-compliance-documentation',
  standalone: true,
  imports: [NgZorroModule],
  templateUrl: './compliance-documentation.component.html',
  styleUrl: './compliance-documentation.component.scss'
})
export class ComplianceDocumentationComponent implements OnInit {
  clientSelected: any = this.eventManager.clientSelected();
  callApi: any = this.eventManager.getPercentApi();
  loadingData: boolean = false;
  percentData: PercentInterface = {};
  providerAssistance: GetAssistanceProvider = {}

  showImage: boolean = false;
  response: any = [];

  constructor(
    private router: Router,
    private eventManager: EventManagerService,
    private documentService: DocumentsCrudService,
    private asistProviderService: ProviderAsisstService,
    private modalService: NzModalService,
  ) {
    effect(() => {
      this.callApi = this.eventManager.getPercentApi();
      if (this.callApi) {
        this.getDocumentPercent();
      }
    });
  }

  ngOnInit() {
    this.getDocumentPercent();
    this.getAssistencesProvider();
  }

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
      },
      error: (error: any) => {
        this.loadingData = false;
      },
      complete: () => { }
    });
  }
  /**
  * Redirecciona a pagina
  */
  goPage() {
    this.router.navigateByUrl(`/cargar-documentos/${this.clientSelected.idClientHoneSolutions}`);
  }

  /**
  * realiza consumo del api para ver la asistencia del prestador  
  * @param payload - recibe el objeto tipo formData
  */
  getAssistencesProvider() {
    this.loadingData = true;
    const { idProvider, idClientHoneSolutions } = this.clientSelected;
    this.asistProviderService.getAssistencesProvider(idProvider, idClientHoneSolutions).subscribe({
      next: (resp: any) => {
        this.loadingData = false;
        this.response = resp;
        this.providerAssistance = resp[0];
      },
      error: (error: any) => {
        this.loadingData = false;

      },
      complete: () => { }
    });
  }
  /**
   * Abre una ventana modal para actualizar el nombre del representante legal, 
   * donde se puede abrir mediante funcion del mismo modal de contacts-provider
   * y tambien se abre por defecto o automaticamente cuando elija allianz
   */
  openModalProviderAssistance() {
    const modal = this.modalService.create<ProviderAssistanceComponent, any>({
      nzContent: ProviderAssistanceComponent,
      nzCentered: true,
      nzClosable: true, //en false para ocultar la X del modal y que no pueda cerrarlo
      // nzFooter: null
      nzMaskClosable: false, // Para evitar que se cierre al hacer clic fuera del modal
      nzOnOk: () => console.log('OK'),
      nzOnCancel: () => console.log('Cancelar') // Maneja el evento de cancelación
    });

    // Return a result when opened
    modal.afterOpen.subscribe(() => { });
    // Return a result when closed
    modal.afterClose.subscribe((result: any) => {
      if (result) {
      }
    });
  }

}
