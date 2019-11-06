import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import { 
  AfterViewInit, 
  Component, 
  EventEmitter,
  Inject,
  ElementRef, 
  OnInit, 
  ViewChild, 
  Output } from '@angular/core';
import { 
  Router, ActivatedRoute } from "@angular/router";
import { Subscription } from 'rxjs/Subscription';
import { 
  MatPaginator, 
  MatSort, 
  MatTableDataSource, 
  MatSnackBar} from "@angular/material";
import { 
  debounceTime, 
  distinctUntilChanged, 
  startWith, 
  tap, 
  delay } from 'rxjs/operators';

import { PhotoService } from "../../../services/photo/photo.service";
import { Photo } from "../../../model/photo/photo.model";


@Component({
  templateUrl: './occurrence-link-photo-dialog.component.html',
  styleUrls: ['./occurrence-link-photo-dialog.component.css']
})
export class OccurrenceLinkPhotoDialogComponent implements OnInit {

  private subscription: Subscription;
  resources: Photo[];
  private sortBy;
  private sortDirection;

  constructor(
    public dialogRef: MatDialogRef<OccurrenceLinkPhotoDialogComponent>,
    private dataService: PhotoService, 
    public snackBar: MatSnackBar,
    private router: Router) {  this.loadData();}

  ngOnInit() {
    //this.loadData();
  }

  loadData() {
    this.subscription  = this.dataService.getCollection(            
        this.sortBy,
        this.sortDirection,
        0,
        10000,
        null).subscribe( 
          photos => {this.resources = photos;}
        );
  }

  onPhotoSelect(photo) {
      this.dialogRef.close(photo);
  }

  getImgMiniatureUrl(photo: Photo) {
    // return photo.getMiniatureUrl();
    return photo.url.replace('O','S');
  }


}
