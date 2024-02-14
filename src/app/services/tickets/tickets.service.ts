import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
   providedIn: 'root'
})
export class TicketsService {
   public url = environment.url;

   constructor (private httpClient: HttpClient) {}

   // Sube los documentos al servidor
   public postTicket (idRole: any, payload: any): Observable<any> {
      return this.httpClient.post(`${this.url}tickestSelect?idRol=${idRole}`, payload);
   }
}
