import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IdentiteResponse } from '../../model/auth/identite-response.model';
import { ProfileService } from "../profile/profile.service";
import { TokenService } from "./token.service";

@Injectable({ providedIn: 'root' }) 
export class DataUsageAgreementService {

  private readonly _localStorageDataUsageAgreementAcceptedKey: string = 'dataUsageAgreementAccepted';


  constructor(
    protected _tokenService: TokenService,
    protected _profileService: ProfileService) { }



    public acceptDua() {
        localStorage.setItem(this._localStorageDataUsageAgreementAcceptedKey, 'true');
  }

    public wasDuaAccepted(): boolean {

        let storedAgreement = localStorage.getItem(this._localStorageDataUsageAgreementAcceptedKey);
        if (null === storedAgreement) {
            let token = this._tokenService.getToken();
            let userId = token.id;

            this._profileService.findByUserId(userId).subscribe(result => {
                if (result && result.length>0) {
                return true;              
                } 
                else {
                return false;
                }

            }, error => {
                return false;
            });
        }
        else {
            return true;
        }


  }
    
}
