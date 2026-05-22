import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, shareReplay, startWith } from 'rxjs';
import { City } from 'src/app/interfaces/city.interface';
import { IdentificationType } from 'src/app/interfaces/identification-type.interface';
import { CitiesService } from '../cities/cities.service';
import { ProviderService } from '../provider/provider.service';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  private cities$?: Observable<City[]>;
  private documentTypes$?: Observable<IdentificationType[]>;

  constructor(
    private citiesService: CitiesService,
    private providerService: ProviderService,
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
  getDocTypes(): Observable<IdentificationType[]> {
    if (!this.documentTypes$) {
      this.documentTypes$ = this.providerService.getIdentificationTypes().pipe(
        catchError(err => {
          this.documentTypes$ = undefined;
          return of([] as IdentificationType[]);
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.documentTypes$;
  }

  refreshDocTypes(): Observable<IdentificationType[]> {
    this.documentTypes$ = undefined;
    return this.getDocTypes();
  }
}
