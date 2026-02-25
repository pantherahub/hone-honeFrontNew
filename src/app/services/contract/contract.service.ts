import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { getHttpParamsByFilters } from 'src/app/utils/http-utils';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  url = environment.url;

  constructor(private httpClient: HttpClient) { }

  public getContracts(reqData: any): Observable<any> {
    const url = `${this.url}ContractRequest/GetAll`;
    const params = {
      isManagerActive: true, // See current ticket manager, no history
      ...reqData,
    };
    return this.httpClient.get(url, { params: getHttpParamsByFilters(params) });
  }

  getContractById(idContract: number): Observable<any> {
    const url = `${this.url}ContractRequest/GetOne/${idContract}`;
    const params = {
      isManagerActive: true // See current ticket manager, no history
    };
    return this.httpClient.get(url, { params: getHttpParamsByFilters(params) });
  }

  sendContractTicketMessage(idContract: number, reqData: any): Observable<any> {
    const url = `${this.url}ContractRequest/CreateMessage/${idContract}`;
    return this.httpClient.post(url, reqData);
  }

}
