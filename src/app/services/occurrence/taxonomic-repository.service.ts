import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {map} from "rxjs/operators";

import { AppConfig } from "../../app.config";
import { TaxoRepo } from "../../model/occurrence/taxo-repo.model";

@Injectable({
  providedIn: 'root'
})
export class TaxonomicRepositoryService {

  private resourceUrl = AppConfig.settings.api.baseUrl + '/taxo_repos';

  constructor(private http: HttpClient) { }

  public getCollection(): Observable<TaxoRepo[]> {
    return this.http.get<TaxoRepo[]>(this.resourceUrl + '.json');
  }
 

}
