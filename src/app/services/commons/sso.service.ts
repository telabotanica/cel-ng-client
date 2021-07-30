import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IdentiteResponse } from '../../model/auth/identite-response.model';

@Injectable({ providedIn: 'root' })
export class SsoService {

  private readonly _identiteEndpoint: string = environment.sso.identiteEndpoint;
  private readonly _refreshEndpoint: string = environment.sso.refreshEndpoint;
  private readonly _localStorageTokenKey: string = 'token';

  constructor(private _http: HttpClient) {
  }

  identity() {
    this._http.get<IdentiteResponse>(
      this._identiteEndpoint, { withCredentials: true })
      .subscribe( resp => {
		this.setToken(resp.token);
	  },
	  error  => {
		this.setToken(null);
	  });
  }

  getIdentity() {
    return this._http.get<IdentiteResponse>(
      this._identiteEndpoint,
      { withCredentials: true });
  }

  refreshToken() {
    this.identity();
  }

  getToken(): string {
    return localStorage.getItem(this._localStorageTokenKey);
  }

  setToken(token: string) {
    localStorage.setItem(this._localStorageTokenKey, token);
  }

  removeToken() {
    localStorage.removeItem(this._localStorageTokenKey);
  }

  isTokenSet(): boolean {
    return !( this.getToken() === null );
  }


}
