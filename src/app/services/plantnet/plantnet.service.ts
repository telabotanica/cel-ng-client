import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from "rxjs/Observable";
import { HttpClient, HttpParams } from "@angular/common/http";

import { PlantnetResponse } from "../../model/plantnet/plantnet-response.model";

@Injectable({
  providedIn: 'root'
})
export class PlantnetService {

  //private plantnetApiKey         = environment.plantnet.apiKey;
  private plantnetBaseUrl        = environment.plantnet.baseUrl;

  get(
    imageUrls: string[], 
    organs: string[], 
    lang: string): Observable<PlantnetResponse> {

    let httpParams= new HttpParams();

    httpParams = httpParams.append("images", this.encodeStringArray(imageUrls));
    httpParams = httpParams.append("organs", this.encodeStringArray(organs));
    httpParams = httpParams.append("lang", lang);
    //    httpParams = httpParams.append("api-key", this.plantnetApiKey);

    return this.http.get<PlantnetResponse>(this.plantnetBaseUrl, 
      {
        params: httpParams,
        headers: {'Accept':'application/json'}
      }
    );
  }

  private encodeStringArray(strArr) {
    let encodedArray = '';
    for(let item of strArr) {
      //encodedArray += '"';
      encodedArray += encodeURI(item);
      //encodedArray += "',';
      encodedArray += ',';
    }
    // Remove the last comma:
    encodedArray = encodedArray.substring(0, encodedArray.length-1);
//    encodedArray += ']';
    console.log(encodedArray);
    return encodedArray;
  }

  constructor(private http:HttpClient) { }
}
