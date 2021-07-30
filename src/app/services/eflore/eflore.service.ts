import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EfloreService {

  private algoliaApplicationId  = environment.algolia.applicationId;
  private algoliaApiKey         = environment.algolia.apiKey;
  private algoliaBaseUrl        = environment.algolia.baseUrl;

  get(sciName: string) {

    let httpParams = new HttpParams();

    httpParams = httpParams.append('x-algolia-application-id', this.algoliaApplicationId);
    httpParams = httpParams.append('x-algolia-api-key', this.algoliaApiKey);

    const payload = {
      'requests': [
        {
          'indexName': 'Flore',
          'params': 'query=' + sciName + '&hitsPerPage=20&maxValuesPerFacet=10&page=0&facets=%5B%22referentiels%22%5D'
    }]};

    return this.http.post(this.algoliaBaseUrl,
      JSON.stringify(payload),
      {
        params: httpParams,
        headers: {'content-type': 'application/x-www-form-urlencoded', 'Accept': 'application/json'}
      }
    );
  }

  constructor(private http: HttpClient) { }

}
