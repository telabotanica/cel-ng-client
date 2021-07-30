import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { PlantnetResponse } from '../../model/plantnet/plantnet-response.model';

@Injectable({
  providedIn: 'root'
})
export class PlantnetService {

  private plantnetBaseUrl = environment.plantnet.baseUrl;

  get(
    imageUrls: string[],
    organs: string[],
    lang: string): Observable<PlantnetResponse> {

    let httpParams = new HttpParams();

    for (const imageUrl of imageUrls) {
        httpParams = httpParams.append('images', imageUrl);
    }
    for (const organ of organs) {
        httpParams = httpParams.append('organs', organ);
    }

    httpParams = httpParams.append('lang', lang);
    //    httpParams = httpParams.append("api-key", this.plantnetApiKey);

    return this.http.get<PlantnetResponse>(this.plantnetBaseUrl,
      {
        params: httpParams,
        headers: {'Accept': 'application/json'}
      }
    );
  }

  private encodeStringArray(strArr) {
    let encodedArray = '';
    for (const item of strArr) {
      encodedArray += encodeURI(item);
      encodedArray += ',';
    }
    // Remove the last comma:
    encodedArray = encodedArray.substring(0, encodedArray.length - 1);
    console.log(encodedArray);
    return encodedArray;
  }

  constructor(private http: HttpClient) { }
}
