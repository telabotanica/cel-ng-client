import { Component } from '@angular/core';
import { 
  MatSnackBar
} from "@angular/material";
import {
    ActivatedRoute
} from "@angular/router";

import { DataUsageAgreementService } from "../../../services/commons/data-usage-agreement.service";

@Component({
  selector: 'app-user-agreement',
  templateUrl: './user-agreement.component.html',
  styleUrls: ['./user-agreement.component.css']
})
export class UserAgreementComponent {

    version: string;

  constructor(
        private route: ActivatedRoute,
    private _dataUsageAgreementService: DataUsageAgreementService
  ) { 

        this.route.params.subscribe(params => {
            this.version = params['version'];
    });

}

    acceptUserAgreement() {
        this._dataUsageAgreementService.acceptDua();

    }


}
