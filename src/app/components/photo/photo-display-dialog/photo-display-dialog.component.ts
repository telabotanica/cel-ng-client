import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";

import { Photo } from "../../../model/photo/photo.model";

@Component({
  selector: 'app-photo-display-dialog',
  templateUrl: './photo-display-dialog.component.html',
  styleUrls: ['./photo-display-dialog.component.css']
})
export class PhotoDisplayDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<PhotoDisplayDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public photo: Photo) {

  }

  ngOnInit() {
  }

}
