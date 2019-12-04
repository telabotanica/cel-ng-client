import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';

import { environment } from '../../environments/environment';
import { SsoService } from "../services/commons/sso.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private _baseCelApiUrl: string = environment.api.baseUrl;

  constructor(private _ssoService: SsoService) { }

  intercept(request: HttpRequest<any>,
            next: HttpHandler): Observable<HttpEvent<any>> {

    const token = this._ssoService.getToken();

    // Add authorization request header with auth token if available for CEL2 
    // and SSO api calls:
    if ( this.applies(request, token) ) {
      request = request.clone({
          setHeaders: {
              'Authorization': `${token}`
          }
      });
    }

    return next.handle(request);
  }

  private applies(request:HttpRequest<any>, token:string): boolean {
    return (  token && ( request.url.startsWith(this._baseCelApiUrl) || request.url.startsWith('https://beta.tela-botanica.org/service:annuaire:auth') ) );
  }

}
