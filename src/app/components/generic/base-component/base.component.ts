import { Component, OnInit, Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { DeviceDetectionService } from "../../../services/commons/device-detection.service";
import { ProfileService } from "../../../services/profile/profile.service";
import { TokenService } from "../../../services/commons/token.service";
import { DataUsageAgreementService } from "../../../services/commons/data-usage-agreement.service";


@Injectable()
export abstract class BaseComponent implements OnInit {

  constructor(
    protected _tokenService: TokenService,
    protected _profileService: ProfileService,
    protected _dataUsageAgreementService: DataUsageAgreementService,
    protected _deviceDetectionService: DeviceDetectionService,
    protected _router: Router) { }

    ngOnInit() {
        if (this._dataUsageAgreementService.wasDuaAccepted()) {
            this.navigateToUserAgreement();
        }
    }

    private navigateToUserAgreement() {
        this._router.navigateByUrl('/user-agreement');
    }

}
