import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactsProviderService {
  public url = environment.url;

  constructor(private httpClient: HttpClient) {}

  getTemporalContactsById(modelType: string, id: number) {
    let url = `${this.url}TemporalContacts/GetAll`;
    let params = `/Type/${modelType}/Id/${id}`;
    return this.httpClient.get(url + params);
  }

  getOccupationTypes(): Observable<any> {
    return this.httpClient.get(`${this.url}Occupations/Type/GetAll`);
  }

  getOccupation(
    idOccupationType: number,
    type: string | null = null
  ): Observable<any> {
    let url = `${this.url}Occupations/Type/${idOccupationType}`;
    if (type) url += `/${type}`;
    return this.httpClient.get(url);
  }
}
