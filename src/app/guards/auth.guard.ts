import { Injectable, Inject } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../environments/environment';

import { SsoService } from '../services/commons/sso.service';
import {
    DataUsageAgreementService
} from '../services/commons/data-usage-agreement.service';
import {
    NavigationService
} from '../services/commons/navigation.service';

/**
 *
 *
 * <ul>
 *  <li>SSO token setting/login redirection</li>
 *  <li>data usage agreement (DUA) management</li>
 * </ul>
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  private readonly _ssoAuthWidgetUrl: string = environment.sso.authWidgetUrl;
  private readonly _refreshInterval: number  = environment.sso.refreshInterval;
  private readonly _unsetTokenValue: string  = environment.app.unsetTokenValue;
  private readonly _absoluteBaseUrl: string  = environment.app.absoluteBaseUrl;

  constructor(
     private router: Router,
     private _ssoService: SsoService,
    private _navigationService: NavigationService,
        private _dataUsageAgreementService: DataUsageAgreementService,
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
            this._ssoService.setToken(response.token);
            this._dataUsageAgreementService.setToken(response.token);
            this.checkDua();

            // The token expires after 15 minutes. We need to refresh it
            // periodically to always keep it fresh
            Observable.interval(this._refreshInterval)
                .subscribe((resp) => {
                    this._ssoService.refreshToken();
            });
            return true;
         }
      }).catch(
        error => {
          this.loadAuthWidget();
          return Observable.throw(error.statusText);
        }
      );

    } else if (token) {
      this.checkDua();
      return true;
    }

    this.loadAuthWidget();
    // return false;

  }


  loadAuthWidget(): void {
    console.log('not logged');
    this.document.location.href = this._ssoAuthWidgetUrl + '?origine=' + this._absoluteBaseUrl;
  }
  checkDua(): void {
           if ( ! this._dataUsageAgreementService.checkIfDuaWasAcceptedCached() ) {

              this._dataUsageAgreementService.checkIfDuaWasAccepted().subscribe(result => {
                    if (!result || result.length == 0) {
                        this.navigateToUserAgreementForm();
                    }

                }, error => {
                        this.navigateToUserAgreementForm();
                });
            }

    }



    private navigateToUserAgreementForm() {
        this._navigationService.navigateToUserAgreementForm();
    }

}
