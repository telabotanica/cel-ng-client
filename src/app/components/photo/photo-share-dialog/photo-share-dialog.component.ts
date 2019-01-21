import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";

import { Photo } from "../../../model/photo/photo.model";

@Component({
  selector: 'app-photo-share-dialog',
  templateUrl: './photo-share-dialog.component.html',
  styleUrls: ['./photo-share-dialog.component.css']
})
export class PhotoShareDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<PhotoShareDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public url: string) {

  }

  ngOnInit() {
  }

}
