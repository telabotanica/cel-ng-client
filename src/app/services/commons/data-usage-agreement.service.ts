import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import {
    Router
} from "@angular/router";
import {
  MatSnackBar
} from "@angular/material";

import { Profile
} from "../../model/profile/profile.model";
import { environment } from '../../../environments/environment';
import { ProfileService } from "../profile/profile.service";
import { TokenService } from "./token.service";
import {
    NavigationService
} from "./navigation.service";

@Injectable({ providedIn: 'root' })
export class DataUsageAgreementService {

  private _localStorageDataUsageAgreementAcceptedKey: string;
  // Due to a conccurent race between th
  private token;

  constructor(
    private _snackBar: MatSnackBar,
    private _navigationService: NavigationService,
    private _tokenService: TokenService,
    private _profileService: ProfileService) {
    }



    public rememberDuaWasAccepted() {
console.log("rememberDuaWasAccepted");

            this.initLocalStorageKeyIfNeeded();

        localStorage.setItem(this._localStorageDataUsageAgreementAcceptedKey, 'true');
  }

    public acceptDua() {
console.log("acceptDua");
            let userId = this.getToken().id;
        let profile = new Profile();
        profile.userId = userId;
        this._profileService.post(profile).subscribe(
            p => {
                this.rememberDuaWasAccepted();
          this._snackBar.open(
          "Merci d'avoir accepté la charte d'utilisation.",
          "Fermer",
          { duration: 3500 });
          this.navigateToOccurrenceGrid();

            }
        );

    }

    public setToken(token) {
console.log('ETTING TOKEN IN DUA SRV');
            this.token = this._tokenService.decodeToken(token);
    }

    private getToken() {

        if ( !this.token ) {

             this.token = this._tokenService.getDecodedToken();
        }
        return this.token;
    }


    private initLocalStorageKeyIfNeeded() {
console.log('initLocalStorageKeyIfNeeded');
            let token = this.getToken();
            let userId = token.id;

        if ( !this._localStorageDataUsageAgreementAcceptedKey ) {

             this._localStorageDataUsageAgreementAcceptedKey = 'dataUsageAgreementAccepted' + '_' + userId;

        }
    }

    private navigateToOccurrenceGrid() {
        this._navigationService.navigateToOccurrenceGrid();
    }

/*

    public async checkIfDuaAccepted() {

//            let token = this._tokenService.getToken();
console.log("checkIfDuaAccepted");


            let userId = this.getToken().id ;
            this.initLocalStorageKeyIfNeeded();

        let storedAgreement = localStorage.getItem(this._localStorageDataUsageAgreementAcceptedKey);
        if (null === storedAgreement) {

            this._profileService.findByUserId(userId).subscribe(result => {

                if (!result || result.length==0) {
                    this.navigateToUserAgreementForm();
                }

            }, error => {
                    this.navigateToUserAgreementForm();
            });
        }
        else {
console.debug('sumthing in localstorage');
            return true;
        }


  }

*/

    public checkIfDuaWasAcceptedCached() {
            this.initLocalStorageKeyIfNeeded();

        let storedAgreement = localStorage.getItem(this._localStorageDataUsageAgreementAcceptedKey);

        if (null === storedAgreement) {

            return false;
        }
        return true;
    }

    public checkIfDuaWasAccepted() {

            console.log("checkIfDuaAccepted");


            let userId = this.getToken().id ;


            return this._profileService.findByUserId(userId);


  }


}

