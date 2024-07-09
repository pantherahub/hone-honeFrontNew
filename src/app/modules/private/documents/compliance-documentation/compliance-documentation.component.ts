import { Component, OnInit, effect } from '@angular/core';
import { NgZorroModule } from '../../../../ng-zorro.module';
import { Router } from '@angular/router';
import { EventManagerService } from '../../../../services/events-manager/event-manager.service';
import { PercentInterface } from '../../../../models/client.interface';
import { DocumentsCrudService } from '../../../../services/documents/documents-crud.service';

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


  constructor(
    private router: Router,
    private eventManager: EventManagerService,
    private documentService: DocumentsCrudService,
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

}
