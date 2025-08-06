import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
   providedIn: 'root'
})
export class DocumentsCrudService {
  public url = environment.url;
  private urlPrefix = 'Documents/Providers';

  constructor(private httpClient: HttpClient) { }

  public getPercentDocuments(idProvider: number, idTypeProvider: number, idClient: number): Observable<any> {
    // return this.httpClient.get(`${this.url}${this.urlPrefix}/GetPorcentages/${idProvider}/${idTypeProvider}/${idClient}`);
    return this.httpClient.get(`${this.url}${this.urlPrefix}/GetPorcentages/${idProvider}/${idClient}`);
  }

  public getDocuments(idProvider: number, idClient: number): Observable<any> {
    return this.httpClient.get(`${this.url}${this.urlPrefix}/GetDocuments/${idProvider}/${idClient}`);
  }

  // Llama al api para obtener lista documentos por cargar del prestador
  public getDocumentsToUpload(idProvider: number, idTypeProvider: number, idClient: number): Observable<any> {
    return this.httpClient.get(`${this.url}getDocumentsToUpload/${idProvider}/${idTypeProvider}/${idClient}`);
  }

  // Llama al api para obtener lista documentos cargados del prestador
  public getUploadedDocuments(idProvider: number, idTypeProvider: number, idClient: number): Observable<any> {
    return this.httpClient.get(`${this.url}getUploadedDocuments/${idProvider}/${idTypeProvider}/${idClient}`);
  }

  // Llama al api para obtener lista documentos vencidos del prestador
  public getExpiredDocuments (idProvider: number, idTypeProvider: number, idClient: number): Observable<any> {
    return this.httpClient.get(`${this.url}getExpiredDocuments/${idProvider}/${idTypeProvider}/${idClient}`);
  }

  // Sube los documentos al servidor
  public uploadDocuments (idProvider: number, payload: any): Observable<any> {
    const headers = {
        'Content-Type': 'multipart/form-data',
        accept: 'application/json'
    };
    return this.httpClient.post(`${this.url}uploadsDocuments/${idProvider}`, payload);
  }

  // actualiza los documentos
  public updateDocuments (idDocument: number, payload: any): Observable<any> {
    return this.httpClient.put(`${this.url}updateDocuments/${idDocument}`, payload);
  }

  // actualiza los documentos
  public deleteDocument (idDocument: any): Observable<any> {
    return this.httpClient.delete(`${this.url}deleteDocument/${idDocument}`);
  }

  downloadFile(filename: string) {
    return this.httpClient.get( 'http://localhost:4200/' + filename, {
      responseType: 'arraybuffer'
    });
  }
}
