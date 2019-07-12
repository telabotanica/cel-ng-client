import {
    Inject
} from '@angular/core';
import {
    Component,
    OnInit
} from '@angular/core';
import {
    Router
} from "@angular/router";
import {
    DOCUMENT
} from '@angular/common';
import * as jwt_decode from "jwt-decode";

import {
    environment
} from '../../../../environments/environment';
import { Profile 
} from "../../../model/profile/profile.model";
import {
    SsoService
} from "../../../services/commons/sso.service";
import {
    DeviceDetectionService
} from "../../../services/commons/device-detection.service";
import {
    NavigationService
} from "../../../services/commons/navigation.service";
import {
    ProfileService
} from "../../../services/profile/profile.service";

@Component({
    selector: 'app-user-profile-ui',
    templateUrl: './user-profile-ui.component.html',
    styleUrls: ['./user-profile-ui.component.css']
})
export class UserProfileUiComponent implements OnInit {

    private static readonly _ssoAuthWidgetUrl: string = environment.sso.authWidgetUrl;
    private static readonly _profileUrl: string = environment.telaWebSite.profileUrl;
    private static readonly _importTemplateUrl: string = environment.app.importTemplateUrl;
    private static readonly _contactUrl: string = environment.telaWebSite.contactUrl;
    private static readonly _helpUrl: string = environment.app.helpUrl;
    private static readonly _appAbsoluteBaseUrl: string = environment.app.absoluteBaseUrl;
    private static readonly _homepageUrl: string = environment.telaWebSite.homepageUrl;
    private static readonly _ministereMTESHomepageUrl: string = environment.misc.ministereMTESHomepageUrl;
    private decodedToken;
    isMobile = false;
    profile: Profile;

    constructor(
        private _navigationService: NavigationService,
        private _deviceDetectionService: DeviceDetectionService,
        private _profileService: ProfileService,
        private ssoService: SsoService,
        @Inject(DOCUMENT) private document: any) {}

    ngOnInit() {
        this._initResponsive();
        let token = this.ssoService.getToken();
        this.decodedToken = this.getDecodedAccessToken(token);
    }

    loadProfile() {
        this._initResponsive();
        let token = this.ssoService.getToken();
        this.decodedToken = this.getDecodedAccessToken(token);
    }

    private _initResponsive() {

        // @responsive: sets isMobile member value
        this._deviceDetectionService.detectDevice().subscribe(result => {
            this.isMobile = result.matches;
        });
    }

    getDecodedAccessToken(token: string): any {
        try {
            return jwt_decode(token);
        } catch (Error) {
            return null;
        }
    }

    toggleAlwaysDisplayExtraFields(event) {

    }

    navigateToHelp() {
        this._navigationService.navigateToHelp();
    }

    navigateToUserAgreement() {
        this._navigationService.navigateToUserAgreement();
    }

    navigateToImportTemplate() {
        this._navigationService.navigateToImportTemplate();
    }

    getProfileUrl() {
        return UserProfileUiComponent._profileUrl;
    }

    getUsername() {
        let pseudoUsed = this.decodedToken.pseudoUtilise;
        if (pseudoUsed) {
            return this.decodedToken.pseudo;
        }
        return `${this.decodedToken.prenom} ${this.decodedToken.nom}`;
    }

    logout() {
                this._navigationService.logout();
    }

    navigateToWpProfileSettings() {
                this._navigationService.navigateToWpProfileSettings();
    }

    navigateToContact() {
                this._navigationService.navigateToContact();
    }

    navigateToTelaHomepage() {
                this._navigationService.navigateToTelaHomepage();
    }

    navigateToMinistereMTESHomepage() {
                this._navigationService.navigateToMinistereMTESHomepage();
    }

    patchProfile(profile: Profile) {
        this.document.location.href = UserProfileUiComponent._ministereMTESHomepageUrl;
    }





}
