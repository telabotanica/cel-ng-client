import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';
import { 
  MatPaginator, 
  MatSort, 
  MatDialogRef,
  MatTableDataSource, 
  MatDialogConfig, 
  MatSnackBar,
  MatDialog } from "@angular/material";
import { 
  Router } from "@angular/router";
import * as Leaflet from 'leaflet';

import { environment } from '../../../../environments/environment';
import { FileData } from "tb-dropfile-lib/lib/_models/fileData.d";
import { OccurrencesDataSource } from "../../../services/occurrence/occurrences.datasource";
import { Photo } from "../../../model/photo/photo.model";

@Component({
  selector: 'occurrence-photo-gallery',
  templateUrl: './occurrence-photo-gallery.component.html',
  styleUrls: ['./occurrence-photo-gallery.component.css']
})
export class OccurrencePhotoGalleryComponent implements OnInit {

  private subscription: Subscription;
  resources: Photo[] = [];
  // The ids of selected photos:
  selected = [];
  baseCelApiUrl: string = environment.api.baseUrl;
  enabled = true;
  @Input('occurrenceId') occurrenceId: number;
  @Input('enableRemove') enableRemove: boolean = false;
  @Output() onPhotoRemoved = new EventEmitter<Photo>();

  constructor(
    private dataService: OccurrencesDataSource, 
    private dialog: MatDialog, 
    public snackBar: MatSnackBar,
    private router: Router ) { }

  ngOnInit() {
    console.log("ngOnInit");
    if ( this.occurrenceId ) {
      this.loadData();
    }
  }

  reset() {
    this.selected = [];
    this.resources = [];
  }

  disable() {
    this.enabled = false;
  }

  enable() {
    this.enabled = true;
  }


  _emptySelection() {
    this.selected = [];
  }

  removePhoto(photo: Photo) {
		let index = this.resources.indexOf(photo);
		if (index > -1) {
  		this.resources.splice(index, 1);
		}
    this.onPhotoRemoved.emit(photo);
  }

  loadData() {
    if ( this.occurrenceId ) {
		  this.dataService.getPhotos(this.occurrenceId).subscribe( 
		    photos => {this.resources = photos;}
		  );
	  }
  }

  isSelected(photo) {
    return (this.selected.includes(photo.id));  
  } 

  onPhotoSelect(photo) {
    if (this.isSelected(photo)) {
      this.selected.splice(this.selected.indexOf(photo.id), 1);  
    }
    else {
      this.selected.push(photo.id);  
    }
  }

  showDetail(photo) {
    this.router.navigate(['/photo-detail', photo.id]);
  }

  getSelectedCount() {
    return this.selected.length;
  }

  addPhoto(photo: Photo) {
    this.resources.push(photo);
  }

  onPhotoAdded(photo: FileData) {
    console.debug(photo);
  }

  onPhotoRejected(photo: FileData) {
  }

}
