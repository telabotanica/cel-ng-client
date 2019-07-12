import {
    Component,
    OnInit,
    Injectable
} from '@angular/core';
import {
    Router
} from '@angular/router';

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
    DataUsageAgreementService
} from "../../../services/commons/data-usage-agreement.service";
import {
    NavigationService
} from "../../../services/commons/navigation.service";

/**
 * Base component responsible for functionalities commonly shared by 
 * CEL components i.e.:
 *
 * <ul>
 *  <li>navigation (app routing)</li>
 *  <li>data usage agreement (DUA) management</li>
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
        protected _dataUsageAgreementService: DataUsageAgreementService,
        protected _deviceDetectionService: DeviceDetectionService,
        protected _router: Router) {}

    ngOnInit() {
       // this._dataUsageAgreementService.checkIfDuaAccepted();
        this.setupResponsive();
    }

    protected setupResponsive() {

        // @responsive: sets public variable
        this._deviceDetectionService.detectDevice().subscribe(result => {
            this.isMobile = result.matches;
        });
    }


    public navigateToCreateOccurrenceForm() {
        this._router.navigateByUrl('/occurrence-form');
    }

    protected navigateToMultiEditOccurrenceForm(strIds) {
        this._router.navigate(['/occurrence-collection-edit-form', strIds]);
    }



  navigateToEditOccurrenceForm(occId) {
    this._router.navigate(['/occurrence-collection-edit-form', occId]);
  }        




    protected logout() {
                this._navigationService.logout();
    }

    protected navigateToWpProfileSettings() {
                this._navigationService.navigateToWpProfileSettings();
    }

    protected navigateToContact() {
                this._navigationService.navigateToContact();
    }

    protected navigateToTelaHomepage() {
                this._navigationService.navigateToTelaHomepage();
    }

    protected navigateToMinistereMTESHomepage() {
                this._navigationService.navigateToMinistereMTESHomepage();
    }

    protected navigateToHelp() {
        this._navigationService.navigateToHelp();
    }

    protected navigateToUserAgreement() {
        this._navigationService.navigateToUserAgreement();
    }

    navigateToImportTemplate() {
        this._navigationService.navigateToImportTemplate();
    }


}
