import { Component, OnInit, effect } from '@angular/core';
import { NgZorroModule } from '../../../../ng-zorro.module';
import { EventManagerService } from '../../../../services/events-manager/event-manager.service';
import { DocumentsCrudService } from '../../../../services/documents/documents-crud.service';
import { PercentInterface } from '../../../../models/client.interface';
import { RemainingDocumentsComponent } from '../remaining-documents/remaining-documents.component';
import { ExpiredDocumentsComponent } from '../expired-documents/expired-documents.component';
import { UploadedDocumentsComponent } from '../uploaded-documents/uploaded-documents.component';
import { Router } from '@angular/router';
import { ContactTicketComponent } from '../../../../shared/modals/contact-ticket/contact-ticket.component';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
   selector: 'app-list-documents',
   standalone: true,
   imports: [ NgZorroModule, RemainingDocumentsComponent, ExpiredDocumentsComponent, UploadedDocumentsComponent ],
   templateUrl: './list-documents.component.html',
   styleUrl: './list-documents.component.scss'
})
export class ListDocumentsComponent implements OnInit {
   clientSelected: any = this.eventManager.clientSelected();
   callApi: any = this.eventManager.getPercentApi();
   loadingData: boolean = false;
   loadBtnDownload: boolean = false;

   percentData: PercentInterface = {};

   constructor (
      private eventManager: EventManagerService,
      private documentService: DocumentsCrudService,
      private router: Router,
      private modalService: NzModalService
   ) {
      effect(() => {
         this.callApi = this.eventManager.getPercentApi();
         if (this.callApi) {
            this.getDocumentPercent();
         }
      });
   }

   ngOnInit (): void {
      this.getDocumentPercent();
   }

   /**
    * Cambia el titulo de la pagina de autogestion por el nombre que obtenga del tab seleccionado
    * inicialmente el titulo es MI PERFIL
    * recibe un arreglo de eventos, en el cual esta el index y la informacion del tab
    * @params event: any
    */
   tabChange (event: any) {}

   /**
    * Obtiene desde un api el porcentaje de documentos cargado, sin cargas y vencidos
    */
   getDocumentPercent () {
      this.loadingData = true;
      const { idProvider, idTypeProvider, idClientHoneSolutions } = this.clientSelected;
      this.documentService.getPercentDocuments(idProvider, idTypeProvider, idClientHoneSolutions).subscribe({
         next: (res: any) => {
            console.log(res);
            this.percentData = res;
            this.loadingData = false;
         },
         error: (error: any) => {
            this.loadingData = false;
         },
         complete: () => {}
      });
   }

   /**
    * Valida el tipo de prestador y descarga un paquete de documentos
    */
   downloadDocuments () {
      if (this.clientSelected.idTypeProvider == 3 || this.clientSelected.idTypeProvider == 6) {
         this.saveAs(
            `assets/documents-provider/A.Persona-Juridica.zip`,
            `A. Documentos para diligenciar Persona Juridica.zip`
         );
         this.saveAs(
            `assets/documents-provider/B.Persona-Juridica.zip`,
            `B. Documentos solo lectura Persona Juridica.zip`
         );
      } else {
         this.saveAs(
            `assets/documents-provider/A.Persona-Natural.zip`,
            `A. Documentos para diligenciar  Persona Natural.zip`
         );
         this.saveAs(
            `assets/documents-provider/B.Persona-Natural.zip`,
            `B. Documentos solo lectura Persona  Natural.zip`
         );
      }
   }

   /**
    * Recibe la url de donde se toman los documentos locales y los descarga
    * @param url - ruta de los assets a descargar
    * @param name - nombre del archivo que se muestra en la descarga
    */
   saveAs (url: any, name: any) {
      this.loadBtnDownload = true;
      const link = document.createElement('a');
      link.setAttribute('type', 'hidden');
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      this.loadBtnDownload = false;
   }

   navigateHome () {
      this.router.navigateByUrl('/home');
   }

   /**
    * Abre una ventana modal para solicitar ticket
    */
   openTicketModal (): void {
      const modal = this.modalService.create<ContactTicketComponent, any>({
         nzContent: ContactTicketComponent,
         nzCentered: true,
         nzClosable: true,
         // nzFooter: null
      });
      const instance = modal.getContentComponent();

      // instance.message = message;

      // Return a result when opened
      modal.afterOpen.subscribe(() => {});
      // Return a result when closed
      modal.afterClose.subscribe((result: any) => {
         if (result) {
         }
      });
   }
}
