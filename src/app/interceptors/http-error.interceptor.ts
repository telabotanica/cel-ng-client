import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import 'rxjs/add/operator/do';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor() {}
 /*
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {



    return next.handle(request).do((event: HttpEvent<any>) => {}, (err: any) => {
      if (err instanceof HttpErrorResponse) {
	// The SSO identitite service returns an HTTP error with status 400
 	// when the user is not logged. This is not an error which should
	// be notified to the user but is part of the normal app flow.
        console.log("ERRRRRRRROR");
      }
    });
*/

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if (err.status === 401) {
                // auto logout if 401 response returned from api
                // this.authenticationService.logout();
                location.reload(true);
            }

            const error = err.error.message || err.statusText;
            return throwError('error');
        }));
    }
}
