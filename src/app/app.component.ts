import { Component, OnInit } from '@angular/core';

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

  constructor(private _ssoService: SsoService) { }

  ngOnInit() {
    // The token hasn't been set yet: let's init it with the "unset" value:
    this._ssoService.setToken(this._unsetTokenValue);
  }

}
