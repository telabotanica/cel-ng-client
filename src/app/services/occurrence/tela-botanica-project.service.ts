import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { TelaBotanicaProject } from '../../model/occurrence/tela-botanica-project.model';

@Injectable({
  providedIn: 'root'
})
export class TelaBotanicaProjectService {

    private resourceUrl = environment.api.baseUrl + '/tela_botanica_projects';

  constructor(private http: HttpClient) { }

  public getCollection(): Observable<TelaBotanicaProject[]> {
    return this.http.get<TelaBotanicaProject[]>(this.resourceUrl + '.json');
  }

}
