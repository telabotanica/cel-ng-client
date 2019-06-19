import { 
  Component, 
  ElementRef, 
  OnInit, 
  Output, 
  EventEmitter, 
  Input 
} from '@angular/core';
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
import { PhotoService } from "../../../services/photo/photo.service";
import { Photo } from "../../../model/photo/photo.model";
import { PhotoFilters } from "../../../model/photo/photo-filters.model";
import { PhotoLinkOccurrenceDialogComponent } from '../photo-link-occurrence-dialog/photo-link-occurrence-dialog.component';
import { ConfirmDialogComponent } from "../../../components/occurrence/confirm-dialog/confirm-dialog.component";
import { DeviceDetectionService } from "../../../services/commons/device-detection.service";

@Component({
  selector: 'app-photo-gallery',
  templateUrl: './photo-gallery.component.html',
  styleUrls: ['./photo-gallery.component.css']
})
export class PhotoGalleryComponent implements OnInit {

  private subscription: Subscription;
  resources: Photo[];
  // The ids of selected photos:
  selected = [];
  _filters: PhotoFilters;
  private sortBy;
  private sortDirection;
  linkToOccDialogRef: MatDialogRef<PhotoLinkOccurrenceDialogComponent>;
  baseCelApiUrl: string = environment.api.baseUrl;
  nbrOfPhotosToBeSEnt = 0;
  sendPhotoFlag: boolean = false;
  @Output() showFilterEvent = new EventEmitter();
  private _confirmDeletionMsg: string = 'Supprimer la/les photo(s) ?';
  public isMobile: boolean = false;

  constructor(
    private dataService: PhotoService, 
    private confirmDeletionDialog: MatDialog, 
    private dialog: MatDialog, 
    public snackBar: MatSnackBar,
    private deviceDetectionService: DeviceDetectionService,
    private router: Router ) { 
    deviceDetectionService.detectDevice().subscribe(result => {
      this.isMobile = result.matches;
    });

  }


  ngOnInit() {
    console.log("ngOnInit");
  }

  refresh() {
    this._emptySelection();
    this.loadData(this._filters);
  }

  _emptySelection() {
    this.selected = [];
  }


  showFilters() {
     this.showFilterEvent.emit();
  }

  @Input() set filters(photoFilters: PhotoFilters) {
    this._filters = photoFilters;
    if (  photoFilters !== null) {
        this._emptySelection();
        this.loadData(photoFilters);
    }
  }

  isSendPhotoButtonDisabled(): boolean {
    return !(this.nbrOfPhotosToBeSEnt > 0)
  }

  onPostPhotoError(data: any) {
    let msg;

    if ( data.error['hydra:description'].includes('is not a valid image') ) {
      msg = "Le fichier n'est pas une image valide.";
    }
    else if ( data.error['hydra:description'].includes('with the same name') ) {
      msg = "Vous avez déjà téléversé une image avec le même nom. Ce n'est pas permis dans le CEL.";
    }
    else {
      msg = "Une erreur est survenue.";
    }
    this.snackBar.open(
      msg, 
      "Fermer", 
      { duration: 2500 });
  }

  onPhotoAdded(photo: FileData) {
    this.nbrOfPhotosToBeSEnt++;
  }

  onPhotoDeleted(photo: FileData) {
    this.nbrOfPhotosToBeSEnt--;
  }

  loadData(filters) {
    this.subscription  = this.dataService.getCollection(            
        this.sortBy,
        this.sortDirection,
        filters).subscribe( 
          photos => {this.resources = photos;}
        );
  }

  openConfirmDeletionDialog(value) {

    let dialogConfig = this.buildDialogConfig();
    dialogConfig.data = this._confirmDeletionMsg;
    let confirmDeletionDialogRef = this.confirmDeletionDialog.open(ConfirmDialogComponent, dialogConfig);

    confirmDeletionDialogRef
      .afterClosed()
      .subscribe( response => {
          if (response == true) {
            this.bulkDelete();
          }
      });
  }

  buildDialogConfig() {
    let dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.hasBackdrop = true;
    return dialogConfig;
  }


  openLinkOccurrenceDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.hasBackdrop = true;
    this.linkToOccDialogRef = this.dialog.open(PhotoLinkOccurrenceDialogComponent, dialogConfig);

    this.linkToOccDialogRef
      .afterClosed()
      .subscribe(
        occ => this.linkToOccurrence(occ)
    );

  }

  addPhoto(photo: Photo) {
    this.resources.push(photo);
  }


  onPhotoUploaded(photo: any) {
    this.addPhoto(photo);
    this.refresh();
    this.snackBar.open(
      "Photo enregistrée avec succès.", 
      'Fermer', 
      { duration: 1500 });
  }

  sendPhotos() {
    this.sendPhotoFlag = true;
    setTimeout(() => {
      this.sendPhotoFlag = false;
    }, 100);
  }

  private _downloadZipInBrowser(data: any) {
    var blob = new Blob([data], { type: "application/zip"});
    var url = window.URL.createObjectURL(blob);
    var pwa = window.open(url);
    //@todo use an angular material dialog
    if ( !pwa || pwa.closed || typeof pwa.closed == 'undefined' ) {
      alert( 'Merci de désactiver votre bloqueur de popups. Il empêche le téléchargement du fichier des étiquettes.');
    }
  }

  bulkDownload() {
    let ids = this.selected;
    this.dataService.download(ids).subscribe(
      data => {
        this._downloadZipInBrowser(data);

      },
      error => this.snackBar.open(
        'Une erreur est survenue. ' + error, 
        'Fermer', 
        { duration: 1500 })
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


  bulkDelete() {
    let ids = this.selected;
    this.dataService.bulkRemove(ids).subscribe(
      data => {
	this.refresh();
        this.snackBar.open(
          'Les photos ont bien été supprimées.', 
          'Fermer', 
          { duration: 1500 });
        for (let id of ids) {
            console.debug(id);
            console.debug(this.resources);
            this.resources = this.resources.filter(photo => photo.id !== id);
        }           
        this.selected = [];             
      },
      error => this.snackBar.open(
        'Une erreur est survenue. ' + error, 
        'Fermer', 
        { duration: 1500 })
    );
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
