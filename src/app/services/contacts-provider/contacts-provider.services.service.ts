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

  getOccupation() {
    return this.httpClient.get(`${this.url}GetOccupation`);
  }
}

