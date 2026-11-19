import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { DocumentRules, DocumentRulesOrigin } from 'src/app/interfaces/document-rules.interface';

@Injectable({
  providedIn: 'root'
})
export class DocumentRulesService {

  private url = environment.url;
  private cache: { [origin: string]: Observable<DocumentRules> } = {};

  constructor(private http: HttpClient) { }

  /**
   * Devuelve las reglas del origen indicado. Se piden una sola vez por sesión;
   * si la petición falla no se guarda en caché para poder reintentar.
   */
  getRules(origin: DocumentRulesOrigin): Observable<DocumentRules> {
    if (!this.cache[origin]) {
      this.cache[origin] = this.http
        .get<{ data: DocumentRules }>(`${this.url}Documents/Rules/${origin}`)
        .pipe(
          map(resp => resp.data),
          tap({ error: () => delete this.cache[origin] }),
          shareReplay(1)
        );
    }
    return this.cache[origin];
  }
}
