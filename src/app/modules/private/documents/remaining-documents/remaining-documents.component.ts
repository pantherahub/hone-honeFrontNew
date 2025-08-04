import { Component, OnInit } from '@angular/core';
import { DocumentsCrudService } from '../../../../services/documents/documents-crud.service';
import { DocumentInterface, PercentInterface } from '../../../../models/client.interface';
import { EventManagerService } from '../../../../services/events-manager/event-manager.service';
import { NgZorroModule } from '../../../../ng-zorro.module';
import { CommonModule } from '@angular/common';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { ProviderAssistanceComponent } from '../../../../shared/modals/provider-assistance/provider-assistance.component';
import { FetchBackend } from '@angular/common/http';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ModalEditDocumentComponent } from '../modal-edit-document/modal-edit-document.component';
import { PipesModule } from 'src/app/pipes/pipes.module';

@Component({
   selector: 'app-remaining-documents',
   standalone: true,
   imports: [NgZorroModule, CommonModule, PipesModule],
   templateUrl: './remaining-documents.component.html',
   styleUrl: './remaining-documents.component.scss'
})
export class RemainingDocumentsComponent implements OnInit {

   loading: boolean = false;
   clientSelected: any = this.eventManager.clientSelected();
   counterApi: any = this.eventManager.getPercentApi();
   loadingData: boolean = false;

   documentList: DocumentInterface[] = [];

  readonly SMLV: number = 1423500;
  readonly typePolicyProviderConfig: { [key: string]: number } = {
    'Psicólogo': 200,
    'Nutricionista': 200,
    'Terapeuta': 200,
    'Fonoaudiólogo': 200,
    'Profesional médico': 420,
    'IPS': 420,
  };

  hasShownAmountMessage: boolean = false;

   constructor(
    private eventManager: EventManagerService,
    private documentService: DocumentsCrudService,
    private modalService: NzModalService,
   ) { }

   ngOnInit(): void {
     this.getDocumentsToUpload();
   }

   getDocumentsToUpload() {
      this.loadingData = true;
      const { idProvider, idTypeProvider, idClientHoneSolutions } = this.clientSelected;
      this.documentService.getDocumentsToUpload(idProvider, idTypeProvider, idClientHoneSolutions).subscribe({
         next: (res: any) => {
            this.documentList = res;
            this.loadingData = false;
         },
         error: (error: any) => {
            this.loadingData = false;
         },
         complete: () => { }
      });
   }

  /**
   * Abre una ventana modal para la carga de documentos
   * @param item - recibe el tipo de documento que desea cargar
   */
  uploadDocumentModal(item: any): void {
    const fileToUpload = new FormData();
    const body: any = {
        idDocumentType: item.idTypeDocuments,
      //   nameRepresentative: item.NameDocument,
    };
    fileToUpload.append('datos', JSON.stringify(body));

    const modal = this.modalService.create<ModalEditDocumentComponent, any>({
       nzContent: ModalEditDocumentComponent,
       nzCentered: true,
       nzClosable: true,
       nzTitle: 'Agregar documento',
       nzFooter: null
    });
    const instance = modal.getContentComponent();

    instance.idDocumentType = item.idTypeDocuments;
    instance.isNew = true;
    instance.bodyData = body;

    // Return a result when opened
    modal.afterOpen.subscribe(() => {});
    // Return a result when closed
    modal.afterClose.subscribe((result: any) => {
       if (result) {
          if (result.response) {
            this.getDocumentsToUpload();
            // location.reload();
            this.eventManager.getPercentApi.set(this.counterApi + 1);
          }
       }
    });
  }

}
