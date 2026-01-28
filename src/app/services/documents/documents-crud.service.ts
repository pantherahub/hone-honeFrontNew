import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
   providedIn: 'root'
})
export class DocumentService {
  public url = environment.url;
  private urlPrefix = 'Documents/Providers';

  private readonly documentNameOverrides: Record<number, string> = {
    136: 'Rethus-registro Sispro',
  };

  constructor(private httpClient: HttpClient) { }

  public getPercentDocuments(idProvider: number, idClient: number): Observable<any> {
    return this.httpClient.get(`${this.url}${this.urlPrefix}/GetPorcentages/${idProvider}/${idClient}`);
  }

  public getDocuments(idProvider: number, idClient: number): Observable<any> {
    return this.httpClient.get(`${this.url}${this.urlPrefix}/GetDocuments/${idProvider}/${idClient}`);
  }

  public uploadDocument(payload: any): Observable<any> {
    return this.httpClient.post(`${this.url}${this.urlPrefix}/Upload/One`, payload);
  }

  public updateDocument(idDocument: number, payload: any): Observable<any> {
    return this.httpClient.put(`${this.url}${this.urlPrefix}/Update/${idDocument}`, payload);
  }

  public deleteDocument(idProvider: number, idDocument: any): Observable<any> {
    const url = `${this.url}${this.urlPrefix}/Delete/${idProvider}/${idDocument}`;
    return this.httpClient.delete(url);
  }

  downloadFile(filename: string) {
    return this.httpClient.get( 'http://localhost:4200/' + filename, {
      responseType: 'arraybuffer'
    });
  }

  formatDocumentName(name?: string, idDocumentType?: number): string {
    if (!name) return '';

    if (idDocumentType && this.documentNameOverrides[idDocumentType]) {
      name = this.documentNameOverrides[idDocumentType];
    }

    const formatted = name.replace(/\s*\[SURA\]$/, '');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

}
