import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateDisclaimerResponsePayload, TypeDisclaimer } from 'src/app/models/disclaimer.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DisclaimerService {

  url = environment.url;

  constructor(private http: HttpClient) { }

  getDisclaimer(module: string, idProvider: number, idClient?: number) {
    const type: TypeDisclaimer = idClient != null ? 'Cliente' : 'General';

    const url =
      `${this.url}Disclaimers/GetByProvider/${idProvider}` +
      `/Module/${encodeURIComponent(module)}` +
      `/Type/${type}` +
      (idClient != null ? `/${idClient}` : '');

    return this.http.get(url);
  }

  sendDisclaimerResponse(payload: CreateDisclaimerResponsePayload) {
    const url = `${this.url}DisclaimerResponses/Create`;
    return this.http.post(url, payload);
  }

}
