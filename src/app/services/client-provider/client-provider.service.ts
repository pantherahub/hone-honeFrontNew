import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ClientInterface } from '../../models/client.interface';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { DocumentType } from 'src/app/models/document-type.interface';

@Injectable({
   providedIn: 'root'
})
export class ClientProviderService {
  public url = environment.url;

  constructor (private httpClient: HttpClient) { }

   // Llama al api para obtener lista de clientes por id prestador
  public getClientListByProviderId(idProvider: any): Observable<ClientInterface[]> {
    const url = `${this.url}getHoneProvider/${idProvider}`;
    return this.httpClient.get<ClientInterface[]>(url);
  }

  getCompanies(): Observable<any> {
    return this.httpClient.get(this.url + "Companies/GetAll");
  }

  getCompaniesByIdClients(reqBody: { clientsIds: number[] }): Observable<any> {
    return this.httpClient.post(`${this.url}TemporalProvider/GetCompaniesByClients`, reqBody);
  }

}
