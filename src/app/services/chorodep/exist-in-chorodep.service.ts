import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ExistInChorodepService {

  private chorodepBaseUrl  = environment.chorodep.baseUrl;

  get(taxoRepoName: string, taxonId: number, country: string, ceZoneGeo: string) {

    let httpParams = new HttpParams();
    const url = this.chorodepBaseUrl + '/' + taxoRepoName + '/' + taxonId;

    httpParams = httpParams.append('pays', country);
    httpParams = httpParams.append('ce_zone_geo', ceZoneGeo);

    return this.http.get(
      url,
      {
        params: httpParams
      }
    );
  }

  constructor(private http: HttpClient) { }

}
