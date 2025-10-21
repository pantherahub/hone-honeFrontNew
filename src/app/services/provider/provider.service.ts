import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DocumentType } from 'src/app/models/document-type.interface';
import { TempProviderDataValidation } from 'src/app/models/temporal-provider.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProviderService {

  url = environment.url;

  constructor(private httpClient: HttpClient) { }

  getIdentificationTypes(): Observable<DocumentType[]> {
    return this.httpClient.get<DocumentType[]>(this.url + "getTypeDocument");
  }

  getTemporalProviderData(idProvider: any): Observable<any> {
    return this.httpClient.get(`${this.url}TemporalProvider/GetOne/Provider/${idProvider}`);
  }

  validateTemporalProviderDataCreate(data: TempProviderDataValidation) {
    const url = `${this.url}TemporalProvider/ValidateForCreateTemporalProvider`;
    return this.httpClient.post(url, data);
  }

  validateTemporalProviderDataUpdate(data: TempProviderDataValidation) {
    const url = `${this.url}TemporalProvider/ValidateForUpdateTemporalProvider`;
    return this.httpClient.put(url, data);
  }

  sendTemporalProviderForm(data: any) {
    return this.httpClient.post(`${this.url}TemporalProvider/Store`, data);
  }

  updateTemporalProviderForm(data: any) {
    return this.httpClient.put(`${this.url}TemporalProvider/Update`, data);
  }

}
