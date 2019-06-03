import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { environment } from '../environments/environment';
import { SsoService } from "./services/commons/sso.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  title = environment.app.title;
  private readonly _unsetTokenValue = environment.app.unsetTokenValue;

  constructor(
    public translate: TranslateService,
    private _ssoService: SsoService) { 

    translate.addLangs(['en', 'fr']);
    translate.setDefaultLang('fr');

    const browserLang = translate.getBrowserLang();
    translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');

  }

  ngOnInit() {
    // The token hasn't been set yet: let's init it with the "unset" value:
    this._ssoService.setToken(this._unsetTokenValue);
  }

}
