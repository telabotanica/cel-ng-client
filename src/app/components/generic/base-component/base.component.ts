import {
    Component,
    OnInit,
    Injectable
} from '@angular/core';

import {
    DeviceDetectionService
} from "../../../services/commons/device-detection.service";
import {
    ProfileService
} from "../../../services/profile/profile.service";
import {
    TokenService
} from "../../../services/commons/token.service";
import {
    NavigationService
} from "../../../services/commons/navigation.service";

/**
 * Base component responsible for functionalities commonly shared by 
 * CEL components i.e.:
 *
 * <ul>
 *  <li>navigation (app routing)</li>
 *  <li>device detection</li>
 *  <li>SSO JWT token access/decoding</li>
 * </ul>
 */
@Injectable()
export abstract class BaseComponent implements OnInit {

    isMobile: boolean = false;

    constructor(
        protected _tokenService: TokenService,
        protected _navigationService: NavigationService,
        protected _profileService: ProfileService,
        protected _deviceDetectionService: DeviceDetectionService) {}

    ngOnInit() {
        this.setupResponsive();
    }


    protected setupResponsive() {

        // @responsive: sets public variable
        this._deviceDetectionService.detectDevice().subscribe(result => {
            this.isMobile = result.matches;
        });
    }


    public navigateToCreateOccurrenceForm() {
        this._navigationService.navigateToCreateOccurrenceForm();
    }

    protected navigateToMultiEditOccurrenceForm(strIds) {
        this._navigationService.navigateToMultiEditOccurrenceForm(strIds);
    }



  navigateToEditOccurrenceForm(occId) {
    this._navigationService.navigateToEditOccurrenceForm(occId);
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

    navigateToHelp() {
        this._navigationService.navigateToHelp();
    }

    navigateToUserAgreement() {
        this._navigationService.navigateToUserAgreement();
    }

    navigateToUserAgreementForm() {
        this._navigationService.navigateToUserAgreementForm();
    }

    navigateToImportTemplate() {
        this._navigationService.navigateToImportTemplate();
    }


}
