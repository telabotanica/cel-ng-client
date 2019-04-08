import { Injectable, Inject } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../environments/environment';

import { SsoService } from "../services/commons/sso.service"

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  private readonly _ssoAuthWidgetUrl:string = environment.sso.authWidgetUrl;
  private readonly _refreshInterval:number = environment.sso.refreshInterval;
  private readonly _unsetTokenValue:string = environment.app.unsetTokenValue;

  constructor(
     private router: Router,
     private _ssoService: SsoService,
	 @Inject(DOCUMENT) private document: any
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    const token = this._ssoService.getToken();
        console.log('TOKEN IN canActivate = ' + token);

    // First access to the app, the token hasn't been retrieved yet
    if (token == this._unsetTokenValue) {

      return this._ssoService.getIdentity().map(response => {
        console.debug(response);
        // A token was received so the user is logged
        if ( response.token ) {
          console.log('SETTING TOKEN IN canActivate TO ' + response.token);
          this._ssoService.setToken(response.token);
          // The token expires after 15 minutes. We need to refresh it 
          // periodically to always keep it fresh
          Observable.interval(this._refreshInterval)
            .subscribe((resp) => { 
                this._ssoService.refreshToken();
            });
            return true;
         }
         this.loadAuthWidget();        
         return false;
      });
    
    }
    // We've got a token which should always be fresh so return true (grant access)
    else if (token) {
      return true;
    }

    this.loadAuthWidget();
    return false;
    
  }


  loadAuthWidget(): void {
    console.log('not logged');
    this.document.location.href = this._ssoAuthWidgetUrl + '?origine=https://beta.tela-botanica.org/cel2-dev/cel2-client/dist/cel2-client';
  }

}
