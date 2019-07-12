import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import * as jwt_decode from "jwt-decode";

import {
    SsoService
} from "./sso.service";

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private decodedToken: any;

  constructor(private _ssoService: SsoService) { 
        let token = this._ssoService.getToken();
        this.decodedToken = this.decodeToken(token);
  }


    public decodeToken(token: string): any {
        try {
            return jwt_decode(token);
        } catch (Error) {
            return null;
        }
    }

     getToken() {
        return this.decodedToken;
    }

}
