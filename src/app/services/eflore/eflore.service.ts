import { Injectable } from '@angular/core';

import { Observable } from "rxjs/Observable";
import { HttpClient, HttpParams } from "@angular/common/http";

import { AppConfig } from "../../app.config";

@Injectable({
  providedIn: 'root'
})
export class EfloreService {

  private algoliaApplicationId  = AppConfig.settings.algolia.applicationId;    
  private algoliaApiKey         = AppConfig.settings.algolia.apiKey;
  private algoliaAgent          = AppConfig.settings.algolia.agent;
  private algoliaBaseUrl        = AppConfig.settings.algolia.baseUrl;

  get(sciName:string) {

    let httpParams= new HttpParams();

    httpParams = httpParams.append("x-algolia-application-id", this.algoliaApplicationId);
    httpParams = httpParams.append("x-algolia-api-key", this.algoliaApiKey);
    httpParams = httpParams.append("x-algolia-agent", this.algoliaAgent);

    let payload = {
      "requests":[
        {
          "indexName":"Flore",
          "params":"query=" + sciName + "&hitsPerPage=20&maxValuesPerFacet=10&page=0&facets=%5B%22referentiels%22%5D"
    }]};

    return this.http.post(this.algoliaBaseUrl, 
      JSON.stringify(payload),
      {
        params: httpParams,
        headers: {'content-type':'application/x-www-form-urlencoded', 'Accept':'application/json'}
      }
    );
  }

  constructor(private http:HttpClient) { }

}
