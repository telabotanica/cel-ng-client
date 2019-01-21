import { Injectable } from '@angular/core';

import { Observable } from "rxjs/Observable";
import { HttpClient, HttpParams } from "@angular/common/http";

import { AppConfig } from "../../app.config";

@Injectable({
  providedIn: 'root'
})
export class ExistInChorodepService {

  private chorodepBaseUrl  = AppConfig.settings.chorodep.baseUrl;   

  get(taxoRepoName:string, taxonId: number, country: string, ceZoneGeo:string) {

    let httpParams= new HttpParams();
    let url = this.chorodepBaseUrl + '/' + taxoRepoName + '/' + taxonId;

    httpParams = httpParams.append("pays", country);
    httpParams = httpParams.append("ce_zone_geo", ceZoneGeo);

    return this.http.post(
      url, 
      {
        params: httpParams
      }
    );
  }

  constructor(private http:HttpClient) { }

}
