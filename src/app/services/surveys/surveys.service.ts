import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SurveysService {

  url = environment.url;

  constructor(private http: HttpClient) { }

  sendFeedback(reqData: any) {
    return this.http.post(`${this.url}makeSurveyProvider`, reqData);
  }

}
