import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RateService {

  url = environment.url;

  constructor(private httpClient: HttpClient) { }

  public getRates(idProvider: number, idClient: number): Observable<any> {
    const mockResponse = {
      data: [
        {
          idRateType: 1,
          rateName: 'Insumos',
          currentRate: {
            idRate: 9,
            rateStatus: 'APROBADO',
            dateAdd: '2025-05-14',
            updateAt: '2025-05-14',
            urlObservationsDoc: '',
            nameFile: 'Insumos2025.xls',
            fileSize: '674.4 KB',
            reportDescription: '',
          },
          rateHistory: [
            {
              idRate: 1,
              rateStatus: 'APROBADO',
              dateAdd: '2024-05-14',
              updateAt: '2024-05-15',
              urlObservationsDoc: '',
              nameFile: 'Insumos2024.xls',
              fileSize: '674.4 KB',
            },
            {
              idRate: 2,
              rateStatus: 'APROBADO',
              dateAdd: '2023-05-14',
              updateAt: '2023-05-15',
              urlObservationsDoc: '',
              nameFile: 'Insumos2023.xls',
              fileSize: '674.4 KB',
            },
          ],
        },
        {
          idRateType: 2,
          rateName: 'Medicamentos',
          currentRate: {
            idRate: 10,
            rateStatus: 'EN PROCESO',
            dateAdd: '2025-05-14',
            updateAt: '2025-05-14',
            urlObservationsDoc: '',
            nameFile: 'Medicamentos2025.xls',
            fileSize: '674.4 KB',
            reportDescription: '',
          },
          rateHistory: [
            {
              idRate: 3,
              rateStatus: 'APROBADO',
              dateAdd: '2024-05-14',
              updateAt: '2024-05-15',
              urlObservationsDoc: '',
              nameFile: 'Medicamentos2024.xls',
              fileSize: '674.4 KB',
            },
            {
              idRate: 4,
              rateStatus: 'APROBADO',
              dateAdd: '2023-05-14',
              updateAt: '2023-05-15',
              urlObservationsDoc: '',
              nameFile: 'Medicamentos2023.xls',
              fileSize: '674.4 KB',
            },
          ],
        },
        {
          idRateType: 3,
          rateName: 'Prestaciones',

          currentRate: {
            idRate: 11,
            rateStatus: 'RECHAZADO',
            dateAdd: '2025-05-14',
            updateAt: '2025-05-14',
            urlObservationsDoc: '',
            nameFile: 'Prestaciones2025.xls',
            fileSize: '674.4 KB',
            reportDescription: 'Texto que deja el administrador donde describe el por que fue rechazada las tarifas de prestaciones.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
          },
          rateHistory: [
            {
              idRate: 5,
              rateStatus: 'APROBADO',
              dateAdd: '2024-05-14',
              updateAt: '2024-05-15',
              urlObservationsDoc: '',
              nameFile: 'Prestaciones2024.xls',
              fileSize: '674.4 KB',
            },
            {
              idRate: 6,
              rateStatus: 'APROBADO',
              dateAdd: '2023-05-14',
              updateAt: '2023-05-15',
              urlObservationsDoc: '',
              nameFile: 'Prestaciones2023.xls',
              fileSize: '674.4 KB',
            },
          ],
        },
        {
          idRateType: 4,
          rateName: 'Prestaciones',
          // currentRate: {
          //   idRate: 12,
          //   rateStatus: 'PENDIENTE POR CARGAR',
          //   dateAdd: '2025-05-14',
          //   updateAt: '2025-05-14',
          //   urlObservationsDoc: '',
          //   nameFile: 'Prestaciones2025.xls',
          //   fileSize: '674.4 KB',
          //   reportDescription: '',
          // },
          rateHistory: [
            {
              idRate: 7,
              rateStatus: 'APROBADO',
              dateAdd: '2024-05-14',
              updateAt: '2024-05-15',
              urlObservationsDoc: '',
              nameFile: 'Prestaciones2024.xls',
              fileSize: '674.4 KB',
            },
            {
              idRate: 8,
              rateStatus: 'APROBADO',
              dateAdd: '2023-05-14',
              updateAt: '2023-05-15',
              urlObservationsDoc: '',
              nameFile: 'Prestaciones2023.xls',
              fileSize: '674.4 KB',
            },
          ],
        },
      ],
      message: 'OK',
      success: true
    };
    return of(mockResponse).pipe(delay(700));

    // return this.httpClient.get(`${this.url}/GetRates/${idProvider}/${idClient}`);
  }

  public uploadRate(reqData: FormData): Observable<any> {
    const url = `${this.url}/Upload`;
    return this.httpClient.post(url, reqData);
  }

  public deleteRate(idRate: number): Observable<any> {
    const url = `${this.url}/Delete/${idRate}`;
    return this.httpClient.delete(url);
  }

}
