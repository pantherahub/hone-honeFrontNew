import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DeleteTicketMessagePayload, MessagesFilters, UpdateTicketMessagePayload } from 'src/app/interfaces/ticket.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  url = environment.url;
  urlBack = environment.urlNewBack;

  constructor(private httpClient: HttpClient) { }

  postTicket(idRole: any, payload: any): Observable<any> {
    return this.httpClient.post(`${this.urlBack}ticket/create`, payload);
  }

  getTicketStatus(): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.url}Status/GetAll`);
  }

  getMessagesByTicket(idTicket: number, reqData: MessagesFilters): Observable<any> {
    const url = `${this.url}Tickets/GetMessagesByTicket/${idTicket}`;
    return this.httpClient.post(url, reqData);
  }

  updateTicketMessage(idMessage: number, reqData: UpdateTicketMessagePayload): Observable<any> {
    const url = `${this.url}Tickets/UpdateMessage/${idMessage}`;
    return this.httpClient.put(url, reqData);
  }

  deleteTicketMessage(idMessage: number, reqData: DeleteTicketMessagePayload): Observable<any> {
    const url = `${this.url}Tickets/DeleteMessage/${idMessage}`;
    return this.httpClient.delete(url, {
      body: reqData
    });
  }

}
