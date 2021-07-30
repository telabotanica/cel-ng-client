import {
    Inject
} from '@angular/core';
import {
    Component,
    OnInit
} from '@angular/core';
import {
    FormGroup,
    FormControl
} from '@angular/forms';
import {
    DOCUMENT
} from '@angular/common';
import {
    MatSnackBar,
} from '@angular/material';

import {
    environment
} from '../../../../environments/environment';
import { Profile
} from '../../../model/profile/profile.model';
import {
    DeviceDetectionService
} from '../../../services/commons/device-detection.service';
import {
    NavigationService
} from '../../../services/commons/navigation.service';
import {
    ProfileService
} from '../../../services/profile/profile.service';
import {
    TokenService
} from '../../../services/commons/token.service';
import { BaseComponent } from '../../generic/base-component/base.component';

@Component({
    selector: 'app-user-profile-ui',
    templateUrl: './user-profile-ui.component.html',
    styleUrls: ['./user-profile-ui.component.css']
})
export class UserProfileUiComponent extends BaseComponent implements OnInit {

    private static readonly _profileUrl: string = environment.telaWebSite.profileUrl;
    profileForm: FormGroup;
    profile: Profile;

    constructor(
        protected _navigationService: NavigationService,
        protected _deviceDetectionService: DeviceDetectionService,
        protected _profileService: ProfileService,
        protected _tokenService: TokenService,
        private _snackBar: MatSnackBar,
        @Inject(DOCUMENT) private document: any) {


      super(
        _tokenService,
        _navigationService,
        _profileService,
        _deviceDetectionService);



}



    ngOnInit() {
        super.ngOnInit();
        this._loadProfile();
        this._initFormGroup();
    }

    _loadProfile() {
        const userId =  this._tokenService.getUserId();
        this._profileService.findByUserId(userId).subscribe(
            profiles => {
                if (profiles) {
                    this.profile = profiles[0];
                    this.profileForm.patchValue(this.profile);
                }
            }
        );
    }

    private _initFormGroup() {
        this.profileForm = new FormGroup({
            alwaysDisplayAdvancedFields: new FormControl()
        });
    }


    toggleAlwaysDisplayAdvancedFields(event) {
console.log('toggleAlwaysDisplayAdvancedFields');
console.debug(event);
            this.profile.alwaysDisplayAdvancedFields = this.profileForm.controls['alwaysDisplayAdvancedFields'].value;
            this.patchProfile();

    }



    getProfileUrl() {
        return UserProfileUiComponent._profileUrl;
    }

    getUsername() {
        const pseudoUsed = this._tokenService.isPseudoUsed();
        if (pseudoUsed) {
            return this._tokenService.getPseudo();
        }
        return `${this._tokenService.getFirstName()} ${this._tokenService.getSurname()}`;
    }


    patchProfile() {
console.log('patchProfile');
        this._profileService.patch(this.profile).subscribe(result => {
            this._snackBar.open(
                'Votre profil a été mis à jour avec succès.',
                'Fermer', {
                    duration: 3500
                });
        });
    }





}
