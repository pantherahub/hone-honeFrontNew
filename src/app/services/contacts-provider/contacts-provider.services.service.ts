import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { GetContacProvider, createContactProvider } from '../../models/contact-provider.interface';

@Injectable({
  providedIn: 'root'
})
export class ContactsProviderServicesService {

  public url = environment.url;

  constructor(private httpClient: HttpClient) { }

  public getContactById(idProvider: any): Observable<GetContacProvider> {
    return this.httpClient.get<GetContacProvider>(`${this.url}getContactsByIdProvider/${idProvider}`);
  }

  public updateContactProvider(contact: any) {
    return this.httpClient.put(`${this.url}updateContactProvider`, contact);
  }

  addContactsProvider(contacts: any): Observable<any> {
    return this.httpClient.post(`${this.url}createContactProvider`, contacts);
  }

  getTemporalContactsById(modelType: string, id: number) {
    let url = `${this.url}TemporalContacts/GetAll`;
    let params = `/Type/${modelType}/Id/${id}`;
    return this.httpClient.get(url + params);
  }

  getOccupationTypes(): Observable<any> {
    return this.httpClient.get(`${this.url}Occupations/Type/GetAll`);
  }

  getOccupation(idOccupationType: number, type: string | null = null): Observable<any> {
    let url = `${this.url}Occupations/Type/${idOccupationType}`;
    if (type) url += `/${type}`;
    return this.httpClient.get(url);
  }

}

