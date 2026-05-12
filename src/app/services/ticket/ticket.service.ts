import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DeleteTicketMessagePayload, MessageFilters, TicketFilters, TicketStatus, UpdateTicketMessagePayload } from 'src/app/interfaces/ticket.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  url = environment.url;
  urlBack = environment.urlNewBack;

  constructor(private httpClient: HttpClient) { }

  getTickets(reqData: TicketFilters): Observable<any> {
    return this.httpClient.post(`${this.url}Tickets/GetAll`, reqData);
  }

  getTicketById(idTicket: number) {
    const url = `${this.url}Tickets/GetById/${idTicket}`;
    return this.httpClient.get(url);
  }

  getTicketByCreator(idTicket: number, identification: string) {
    const url = `${this.url}Tickets/GetOneByCreator/${idTicket}/${identification}`;
    return this.httpClient.get(url);
  }

  createTicket(reqData: FormData): Observable<any> {
    const url = `${this.url}Tickets/Create`;
    return this.httpClient.post(url, reqData);
  }

  /* Old version ticket creation */
  postTicket(idRole: any, payload: any): Observable<any> {
    return this.httpClient.post(`${this.urlBack}ticket/create`, payload);
  }

  getTicketStatus(): Observable<TicketStatus[]> {
    return this.httpClient.get<TicketStatus[]>(`${this.url}Status/GetAll`);
  }

  sendMessageByTicket(idTicket: number, reqData: FormData): Observable<any> {
    const url = `${this.url}Tickets/CreateMessageByTicket/${idTicket}`;
    return this.httpClient.post(url, reqData);
  }

  getMessagesByTicket(idTicket: number, reqData: MessageFilters): Observable<any> {
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

  markMessagesViewed(idTicket: number, idProviderLogin: number) {
    const url = `${this.url}Tickets/MarkMessagesViewed/${idTicket}/${idProviderLogin}`;
    return this.httpClient.put(url, {});
  }

}
