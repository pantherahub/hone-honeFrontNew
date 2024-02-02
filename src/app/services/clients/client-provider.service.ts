import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ClientInterface } from '../../models/client.interface';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
   providedIn: 'root'
})
export class ClientProviderService {
   public url = environment.url;

   constructor (private httpClient: HttpClient, private router: Router) {}

   // Llama al api para obtener lista de clientes por id prestador
   public getClientListByProviderId (idProvider: number): Observable<ClientInterface> {
      return this.httpClient.get(`${this.url}getHoneProvider/${idProvider}`);
   }
}
