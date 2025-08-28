import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
   providedIn: 'root'
})
export class DocumentsCrudService {
  public url = environment.url;
  private urlPrefix = 'Documents/Providers';

  constructor(private httpClient: HttpClient) { }

  public getPercentDocuments(idProvider: number, idClient: number): Observable<any> {
    return this.httpClient.get(`${this.url}${this.urlPrefix}/GetPorcentages/${idProvider}/${idClient}`);
  }

  public getDocuments(idProvider: number, idClient: number): Observable<any> {
    return this.httpClient.get(`${this.url}${this.urlPrefix}/GetDocuments/${idProvider}/${idClient}`);
  }

  public uploadDocuments(payload: any): Observable<any> {
    return this.httpClient.post(`${this.url}${this.urlPrefix}/Upload/One`, payload);
  }

  public updateDocuments(idDocument: number, payload: any): Observable<any> {
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

}
