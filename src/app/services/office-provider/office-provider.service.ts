import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OfficeProviderService {

  url = environment.url;

  constructor(private http: HttpClient) { }

  getOfficeProviders(idProvider: any, idRol: any) {
    return this.http.get(`${this.url}getOfficeProviders/${idProvider}/${idRol}`);
  }
}
