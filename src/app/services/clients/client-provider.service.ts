import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ClientInterface } from '../../models/client.interface';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
   providedIn: 'root'
})
export class ClientProviderService {
   public url = environment.url;

  constructor(
    private httpClient: HttpClient
  ) { }

   // Llama al api para obtener lista de clientes por id prestador
  public getClientListByProviderId(idProvider: any): Observable<ClientInterface[]> {
    const url = `${this.url}getHoneProvider/${idProvider}`;
    return this.httpClient.get<ClientInterface[]>(url);
  }

  getIdentificationTypes(): Observable<any> {
    return this.httpClient.get(this.url + "getTypeDocument");
  }

  getProviderData(idProvider: any): Observable<any> {
    return this.httpClient.get(`${this.url}getHoneProvider/${idProvider}`);
  }

  getCompanies(): Observable<any> {
    return this.httpClient.get(this.url + "Companies/GetAll");
  }

  getCompaniesByIdClients(reqBody: any): Observable<any> {
    return this.httpClient.post(`${this.url}TemporalProvider/GetCompaniesByClients`, reqBody);
  }

  getTemporalProviderData(idProvider: any): Observable<any> {
    return this.httpClient.get(`${this.url}TemporalProvider/GetOne/Provider/${idProvider}`);
  }

  sendTemporalProviderForm(data: any) {
    return this.httpClient.post(`${this.url}TemporalProvider/Store`, data);
  }

  updateTemporalProviderForm(data: any) {
    return this.httpClient.put(`${this.url}TemporalProvider/Update`, data);
  }
}
