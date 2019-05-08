import { Component, OnInit, Input } from '@angular/core';
import {Observable} from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';
import { environment } from '../../../../environments/environment';
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

  @Input('occurrenceId') occurrenceId: number;

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

  _emptySelection() {
    this.selected = [];
  }

  loadData() {
    this.dataService.getPhotos(this.occurrenceId).subscribe( 
      photos => {this.resources = photos;}
    );
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



  onPhotoAdded(photo: FileData) {
    console.debug(photo);
  }

  onPhotoRejected(photo: FileData) {
  }


  linkToOccurrence(occurrence) {

    let ids = this.selected;
    this.dataService.bulkReplace(ids, {occurrence:{id:occurrence.id}}).subscribe(
      data => {
        this.snackBar.open(
        "La photo et l’observation ont bien été liées.", 
        "Fermer", 
        { duration: 1500 });
      },
      error => this.snackBar.open(
        'Une erreur est survenue. ' + error, 
        'Fermer', 
        { duration: 1500 })
    );
  }


}
