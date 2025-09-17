import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, shareReplay, startWith } from 'rxjs';
import { City } from 'src/app/models/city.interface';
import { DocumentType } from 'src/app/models/document-type.interface';
import { CitiesService } from '../cities/cities.service';
import { ClientProviderService } from '../clients/client-provider.service';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  private cities$?: Observable<City[]>;
  private docucmentTypes$?: Observable<DocumentType[]>;

  constructor(
    private citiesService: CitiesService,
    private clientProviderService: ClientProviderService,
  ) { }

  // -------------------
  // Cities
  // -------------------
  getCities(): Observable<City[]> {
    if (!this.cities$) {
      this.cities$ = this.citiesService.getCities().pipe(
        startWith([]),
        // map(res => res.data),
        catchError(err => {
          this.cities$ = undefined; // for retry in the next call
          return of([] as City[]);  // default value
        }),
        // cache and share the latest answer
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.cities$;
  }

  refreshCities(): Observable<City[]> {
    this.cities$ = undefined;
    return this.getCities();
  }

  // -------------------
  // Document Types
  // -------------------
  getDocTypes(): Observable<DocumentType[]> {
    if (!this.docucmentTypes$) {
      this.docucmentTypes$ = this.clientProviderService.getIdentificationTypes().pipe(
        catchError(err => {
          this.docucmentTypes$ = undefined;
          return of([] as DocumentType[]);
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.docucmentTypes$;
  }

  refreshDocTypes(): Observable<DocumentType[]> {
    this.docucmentTypes$ = undefined;
    return this.getDocTypes();
  }
}
