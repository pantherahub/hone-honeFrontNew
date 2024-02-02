import { Component, OnInit } from '@angular/core';
import { DocumentsCrudService } from '../../../../services/documents/documents-crud.service';
import { DocumentInterface } from '../../../../models/client.interface';
import { EventManagerService } from '../../../../services/events-manager/event-manager.service';
import { NgZorroModule } from '../../../../ng-zorro.module';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, Observer } from 'rxjs';
import { CommonModule } from '@angular/common';

import { NzUploadFile } from 'ng-zorro-antd/upload';

@Component({
   selector: 'app-remaining-documents',
   standalone: true,
   imports: [ NgZorroModule, CommonModule ],
   templateUrl: './remaining-documents.component.html',
   styleUrl: './remaining-documents.component.scss'
})
export class RemainingDocumentsComponent implements OnInit {
   loading: boolean = false;
   clientSelected: any = this.eventManager.clientSelected();
   loadingData: boolean = false;

   documentList: DocumentInterface[] = [];

   constructor (private eventManager: EventManagerService, private documentService: DocumentsCrudService) {}

   ngOnInit (): void {
      this.getDocumentsToUpload();
   }

   /**
    * Obtiene el listado de documentos sin cargar
    */
   getDocumentsToUpload () {
      this.loadingData = true;
      const { idProvider, idTypeProvider, idClientHoneSolutions } = this.clientSelected;
      this.documentService.getDocumentsToUpload(idProvider, idTypeProvider, idClientHoneSolutions).subscribe({
         next: (res: any) => {
            console.log(res);
            this.documentList = res;
            this.loadingData = false;
         },
         error: (error: any) => {
            this.loadingData = false;
         },
         complete: () => {}
      });
   }

   private getBase64 (img: File, callback: (img: string) => void): void {
      const reader = new FileReader();
      reader.addEventListener('load', () => callback(reader.result!.toString()));
      reader.readAsDataURL(img);
   }

   /**
    * Carga un archivo y lo envia al api de carga de documentos
    * @param event - evento del input que contiene el archivo para cargar
    * @param item - elemento de la lista para saber cual documento de carga ej (cedula, nit, rethus)
    */
   loadFiles (event: any, item: any) {
      if (event.target.files.length > 0) {
         const file: FileList = event.target.files[0];
         this.uploadDocuments(file, item);
      }
   }

   /**
    * Carga un archivo y lo envia al api de carga de documentos
    * @param file - recibe el archivo para cargar
    * @param item - elemento de la lista para saber cual documento de carga ej (cedula, nit, rethus)
    */
   uploadDocuments (file: any, item: any) {
      this.loadingData = true;
      const { idProvider } = this.clientSelected;
      const today = new Date();
      const fileToUpload = new FormData();
      fileToUpload.append('archivo', file);
      const body = {
         posicion: 0,
         nombre: file.name,
         documento: item.idDocument,
         nombredcoumentos: item.NameDocument,
         fechavencimiento: today,
         idUser: idProvider
      };
      fileToUpload.append('datos', JSON.stringify(body));

      this.documentService.uploadDocuments(idProvider, fileToUpload).subscribe({
         next: (res: any) => {
            this.loadingData = false;
            this.getDocumentsToUpload();
            this.eventManager.getPercentApi.set(true);
         },
         error: (error: any) => {
            this.loadingData = false;
         },
         complete: () => {}
      });
   }
}
