import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { 
  MatSnackBar
} from "@angular/material";

import { Profile 
} from "../../../model/profile/profile.model";
import { ProfileService } from "../../../services/profile/profile.service";
import { TokenService } from "../../../services/commons/token.service";

@Component({
  selector: 'app-user-agreement',
  templateUrl: './user-agreement.component.html',
  styleUrls: ['./user-agreement.component.css']
})
export class UserAgreementComponent implements OnInit {



  constructor(
    private _profileService: ProfileService,
    private _snackBar: MatSnackBar,
    private _router: Router,
    private _tokenService: TokenService
  ) { }

  ngOnInit() {
  }

    acceptUserAgreement() {
        let token = this._tokenService.getToken();
        let userId = token.id;
        let profile = new Profile();
        profile.userId = userId;
        this._profileService.post(profile).subscribe(
            p => {
                console.debug(p);
          this._snackBar.open(
          "Merci d'avoir accepté la charte d'utilisation.", 
          "Fermer", 
          { duration: 2500 });
          this.navigateToOccurrenceGrid();

            }
        );

    }
    private navigateToOccurrenceGrid() {
        this._router.navigateByUrl('/occurrence-ui');
    }
}
