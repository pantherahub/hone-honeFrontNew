import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  url = environment.url;

  constructor(private httpClient: HttpClient) { }

  public getContracts(idProvider: number, idClient: number): Observable<any> {
    const mockResponse = {
      data: [],
      message: 'OK',
      success: true
    };
    return of(mockResponse).pipe(delay(700));
  }

}
