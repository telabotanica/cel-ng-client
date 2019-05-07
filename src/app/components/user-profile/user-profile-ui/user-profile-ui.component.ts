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
    this.document.location.href ='https://www.tela-botanica.org/wikini/AideCarnetEnLigne/wakka.php';
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

  navigateToWpProfileSettings() {
    this.document.location.href = this.getProfileUrl() + '/settings/profile';
  }

  getProfileUrl() {
    return 'https://www.tela-botanica.org/membres/'  + this.getUsername();
  }

  navigateToContact() {
    this.document.location.href = 'https://www.tela-botanica.org/widget:reseau:remarques?lang=fr&service=cel&pageSource=https%3A%2F%2Fwww.tela-botanica.org%2Fcel%2Fappli%2Fcel2.html';
  }

}
