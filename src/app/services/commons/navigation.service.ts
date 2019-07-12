import { Injectable, Inject } from '@angular/core';
import {
    Router
} from "@angular/router";
import {
    DOCUMENT
} from '@angular/common';

import {
    environment
} from '../../../environments/environment';

@Injectable({ providedIn: 'root' }) 
export class NavigationService {

    private static readonly _ssoAuthWidgetUrl: string = environment.sso.authWidgetUrl;
    private static readonly _profileUrl: string = environment.telaWebSite.profileUrl;
    private static readonly _importTemplateUrl: string = environment.app.importTemplateUrl;
    private static readonly _contactUrl: string = environment.telaWebSite.contactUrl;
    private static readonly _helpUrl: string = environment.app.helpUrl;
    private static readonly _appAbsoluteBaseUrl: string = environment.app.absoluteBaseUrl;
    private static readonly _homepageUrl: string = environment.telaWebSite.homepageUrl;
    private static readonly _ministereMTESHomepageUrl: string = environment.misc.ministereMTESHomepageUrl;


  constructor(
        private _router: Router,
        @Inject(DOCUMENT) private _document: any) { }

    // ON APP NAVIGATION


    navigateToOccurrenceGrid() {
        this._router.navigateByUrl('/occurrence-ui');
    }

    navigateToUserAgreement() {
        // Cannot use boolean route params?
        this._router.navigate(['/user-agreement', 'detail']);
    }

    navigateToUserAgreementForm() {
        // Cannot use boolean route params?
        let isForm: string = 'no';
        this._router.navigate(['/user-agreement', 'acceptForm'  ]);
    }


    // EXTERNAL NAVIGATION

    logout() {
        this._document.location.href = `${NavigationService._ssoAuthWidgetUrl}?action=deconnexion&origine=${NavigationService._appAbsoluteBaseUrl}`;
    }

    navigateToWpProfileSettings() {
        this._document.location.href = NavigationService._profileUrl;
    }

    navigateToContact() {
        this._document.location.href = NavigationService._contactUrl;
    }

    navigateToTelaHomepage() {
        this._document.location.href = NavigationService._homepageUrl;
    }

    navigateToMinistereMTESHomepage() {
        this._document.location.href = NavigationService._ministereMTESHomepageUrl;
    }

    navigateToHelp() {
        this._document.location.href = NavigationService._helpUrl;
    }


    navigateToImportTemplate() {
        this._document.location.href = NavigationService._importTemplateUrl;
    }


   
}
