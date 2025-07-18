import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { GetContacProvider, createContactProvider } from '../../models/contact-provider.interface';

@Injectable({
  providedIn: 'root'
})
export class ProviderAsisstService {

  public url = environment.url;

  constructor(private httpClient: HttpClient) { }

  addAsistenceProvider(query: any): Observable<any> {
    return this.httpClient.post(`${this.url}createAsistenceProvider`, query);
  }

}
