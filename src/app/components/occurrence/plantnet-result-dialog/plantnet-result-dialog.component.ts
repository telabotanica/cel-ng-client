import { Component, OnInit,EventEmitter } from '@angular/core';
import { Inject } from '@angular/core';
import { MatDialogRef } from "@angular/material";
import { MAT_DIALOG_DATA } from '@angular/material';

import { PlantnetResponse } from "../../../model/plantnet/plantnet-response.model";

@Component({
  selector: 'plantnet-result-dialog',
  templateUrl: './plantnet-result-dialog.component.html',
  styleUrls: ['./plantnet-result-dialog.component.css']
})
export class PlantnetResultDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public plantnetResponse: PlantnetResponse,
    private dialogRef: MatDialogRef<PlantnetResultDialogComponent>) { }

  ngOnInit() {

  }

    
  close() {
    this.dialogRef.close();
  }

  onResultSelect(sciName: string, authorship:string) {

    let taxon = {
        name: sciName,
        repository: 'bdtfx', 
        idNomen: null, 
        author: authorship
    }

    this.dialogRef.close(taxon);
  }


}
