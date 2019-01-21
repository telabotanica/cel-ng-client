import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {map} from "rxjs/operators";

import { AppConfig } from "../../app.config";
import { TelaBotanicaProject } from "../../model/occurrence/tela-botanica-project.model";

@Injectable({
  providedIn: 'root'
})
export class TelaBotanicaProjectService {

    private resourceUrl = AppConfig.settings.api.baseUrl + '/tela_botanica_projects';

  constructor(private http: HttpClient) { }

  public getCollection(): Observable<TelaBotanicaProject[]> {
    return this.http.get<TelaBotanicaProject[]>(this.resourceUrl + '.json');
  }

}
