import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import {
    Router
} from '@angular/router';

import { environment } from '../environments/environment';
import { SsoService } from './services/commons/sso.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  readonly title = environment.app.title;
  private readonly _unsetTokenValue = environment.app.unsetTokenValue;

  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer:    DomSanitizer,
    public translate:     TranslateService,
    private _ssoService:  SsoService) {

    this.initI18n();
    this.registerIcons();
    // The token hasn't been set yet: let's init it with the "unset" value:
    this._ssoService.setToken(this._unsetTokenValue);

  }

  private initI18n() {
    const browserLang = this.translate.getBrowserLang();
    this.translate.addLangs(['en', 'fr']);
    this.translate.setDefaultLang('fr');
    this.translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
  }


  // Registers the icons for the "filter" and "import" buttons.
  private registerIcons() {
    // @refactor: loop arraound an array
    this.iconRegistry.addSvgIcon(
      'filter',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/filter-icon.svg'));
    this.iconRegistry.addSvgIcon(
      'import',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/import-icon.svg'));
    this.iconRegistry.addSvgIcon(
      'burger',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/burger-icon.svg'));
    this.iconRegistry.addSvgIcon(
      'close',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/close-icon.svg'));
    this.iconRegistry.addSvgIcon(
      'cel',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/cel-icon.svg'));
  }

}
