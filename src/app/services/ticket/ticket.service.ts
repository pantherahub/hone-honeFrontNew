import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DeleteTicketMessagePayload, MessageFilters, TicketFilters, TicketStatus, UpdateTicketMessagePayload } from 'src/app/interfaces/ticket.interface';
import { getHttpParamsByFilters } from 'src/app/utils/http-utils';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  url = environment.url;
  private baseUrl = this.url + 'Tickets';
  private readonly apiKeyHeaders = new HttpHeaders({
    'x-api-key': environment.API_KEY
  });

  constructor(private httpClient: HttpClient) { }

  getTickets(reqData: TicketFilters): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/GetAll`, reqData, { headers: this.apiKeyHeaders });
  }

  getTicketById(idTicket: number) {
    const url = `${this.baseUrl}/GetById/${idTicket}`;
    return this.httpClient.get(url, { headers: this.apiKeyHeaders });
  }

  getTicketByCreator(idTicket: number, identification: string) {
    const url = `${this.baseUrl}/GetOneByCreator/${idTicket}/${identification}`;
    return this.httpClient.get(url, { headers: this.apiKeyHeaders });
  }

  createTicket(reqData: FormData): Observable<any> {
    const url = `${this.baseUrl}/Create`;
    return this.httpClient.post(url, reqData, {
      headers: this.apiKeyHeaders,
      observe: 'response'
    });
  }

  getTicketStatus(): Observable<TicketStatus[]> {
    return this.httpClient.get<TicketStatus[]>(`${this.url}Status/GetAll`);
  }

  getRequestTypes(): Observable<any> {
    const url = `${this.baseUrl}/GetRequestTypes`;
    const params = {
      isTicket: true,
      isProvider: true,
    };
    return this.httpClient.get(url, {
      headers: this.apiKeyHeaders,
      params: getHttpParamsByFilters(params)
    });
  }

  sendMessageByTicket(idTicket: number, reqData: FormData): Observable<any> {
    const url = `${this.baseUrl}/CreateMessageByTicket/${idTicket}`;
    return this.httpClient.post(url, reqData, { headers: this.apiKeyHeaders });
  }

  getMessagesByTicket(idTicket: number, reqData: MessageFilters): Observable<any> {
    const url = `${this.baseUrl}/GetMessagesByTicket/${idTicket}`;
    return this.httpClient.post(url, reqData, { headers: this.apiKeyHeaders });
  }

  updateTicketMessage(idMessage: number, reqData: UpdateTicketMessagePayload): Observable<any> {
    const url = `${this.baseUrl}/UpdateMessage/${idMessage}`;
    return this.httpClient.put(url, reqData, { headers: this.apiKeyHeaders });
  }

  deleteTicketMessage(idMessage: number, reqData: DeleteTicketMessagePayload): Observable<any> {
    const url = `${this.baseUrl}/DeleteMessage/${idMessage}`;
    return this.httpClient.delete(url, {
      headers: this.apiKeyHeaders,
      body: reqData
    });
  }

  markMessagesViewed(idTicket: number, idProviderLogin: number) {
    const url = `${this.baseUrl}/MarkMessagesViewed/${idTicket}/${idProviderLogin}`;
    return this.httpClient.put(url, {}, { headers: this.apiKeyHeaders });
  }

  /**
   * If the ticket has been escalated via a subticket, retrieve the client to whom it was escalated.
  */
  getScalingByTicket(idTicket: number): Observable<any> {
    const url = `${this.baseUrl}/GetScalingById/${idTicket}`;
    return this.httpClient.get(url, { headers: this.apiKeyHeaders });
  }

}
