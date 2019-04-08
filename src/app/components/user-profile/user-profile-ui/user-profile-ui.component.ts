import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { environment } from '../../../../environments/environment';
import { DOCUMENT } from '@angular/common';
import * as jwt_decode from "jwt-decode";

import { SsoService } from "../../../services/commons/sso.service";

@Component({
  selector: 'app-user-profile-ui',
  templateUrl: './user-profile-ui.component.html',
  styleUrls: ['./user-profile-ui.component.css']
})
export class UserProfileUiComponent implements OnInit {

  private ssoAuthWidgetUrl = environment.sso.authWidgetUrl;
  private decodedToken;

  constructor(
    private router: Router, 
    private ssoService: SsoService,
    @Inject(DOCUMENT) private document: any) { }

  ngOnInit() {
    let token = this.ssoService.getToken();
    this.decodedToken = this.getDecodedAccessToken(token);
  }

  getDecodedAccessToken(token: string): any {
    try{
        return jwt_decode(token);
    }
    catch(Error){
        return null;
    }
  }

  navigateToHelp() {
    this.router.navigate(['/help']);
  }

  getUsername() {
    let pseudoUsed = this.decodedToken.pseudoUtilise;
    if ( pseudoUsed ) {
      return this.decodedToken.pseudo;
    }
    return this.decodedToken.prenom + ' ' + this.decodedToken.nom;
  }

  logout() {
    this.document.location.href = this.ssoAuthWidgetUrl + '?action=deconnexion&origine=https://beta.tela-botanica.org/cel2-dev/cel2-client/dist/cel2-client';;
  }

  navigateToWpProfile() {
    this.document.location.href = 'https://beta.tela-botanica.org/test/membres/'  + this.getUsername();
  }

}
