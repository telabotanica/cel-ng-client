import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { map } from "rxjs/operators";

import { TaxoRepo } from "../../model/occurrence/taxo-repo.model";

@Injectable({
  providedIn: 'root'
})
export class TaxonomicRepositoryService {

  private resourceUrl = 'http://localhost:8080/api/taxo_repos';

  constructor(private http: HttpClient) { }

  public getCollection(): Observable<TaxoRepo[]> {
    return this.http.get<TaxoRepo[]>(this.resourceUrl + '.json');
  }
 

}
