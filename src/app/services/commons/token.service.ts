import { Injectable } from '@angular/core';
import * as jwt_decode from 'jwt-decode';

import {
    SsoService
} from './sso.service';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor(private _ssoService: SsoService) {
  }


    public decodeToken(token: string): any {
        try {
            return jwt_decode(token);
        } catch (Error) {
            return null;
        }
    }

     getDecodedToken() {
        return this.decodeToken(this.getToken());
    }

     getToken() {
        return this._ssoService.getToken();
    }

     getUserId() {
        return this.getDecodedToken() ? this.getDecodedToken().id : null;
    }

     getPseudo() {
        return this.getDecodedToken() ? this.getDecodedToken().pseudo : null;
    }

     isPseudoUsed() {
        return this.getDecodedToken() ?
            this.getDecodedToken().pseudoUtilise : null;
    }

     getFirstName() {
        return this.getDecodedToken() ? this.getDecodedToken().prenom : null;
    }

     getSurname() {
        return this.getDecodedToken() ? this.getDecodedToken().nom : null;
    }



}
