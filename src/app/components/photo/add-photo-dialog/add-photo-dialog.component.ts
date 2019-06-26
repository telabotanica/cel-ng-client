import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import { 
  AfterViewInit, 
  Component, 
  EventEmitter,
  Inject,
  ElementRef, 
  ViewChild, 
  Output } from '@angular/core';
import { 
  HttpClient, HttpParams } from "@angular/common/http";
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
import { merge } from "rxjs/observable/merge";
import { fromEvent } from 'rxjs/observable/fromEvent';
import { SelectionModel } from '@angular/cdk/collections';

import { FileData } from "tb-dropfile-lib/lib/_models/fileData.d";
import { environment } from '../../../../environments/environment';
import { Photo } from "../../../model/photo/photo.model";

@Component({
  selector: 'add-photo-dialog',
  templateUrl: './add-photo-dialog.component.html',
  styleUrls: ['./add-photo-dialog.component.css']
})
export class AddPhotoDialogComponent {

  baseCelApiUrl: string = environment.api.baseUrl;
  nbrOfPhotosToBeSEnt = 0;
  sendPhotoFlag: boolean = false;
  @Output() onPhotoUploadedEvent: EventEmitter<Photo> = new EventEmitter<Photo>();
  @Output() onPhotoAddedEvent: EventEmitter<Photo> = new EventEmitter<Photo>();
  @Output() onPhotoDeletedEvent: EventEmitter<Photo> = new EventEmitter<Photo>();

  constructor(
    public dialogRef: MatDialogRef<AddPhotoDialogComponent>,    
    public snackBar: MatSnackBar) { }

  onPhotoAdded(photo: Photo) {
    this.nbrOfPhotosToBeSEnt++;
    this.onPhotoAddedEvent.emit(photo);
  }

  onPhotoDeleted(photo: Photo) {
    this.nbrOfPhotosToBeSEnt--;
    this.onPhotoDeletedEvent.emit(photo);
  }

  isSendPhotoButtonDisabled(): boolean {
    return !(this.nbrOfPhotosToBeSEnt > 0)
  }


  sendPhotos() {
    this.sendPhotoFlag = true;
    setTimeout(() => {
      this.sendPhotoFlag = false;
    }, 100);
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

  onPhotoUploaded(photo: Photo) {
    this.snackBar.open(
      "Photo enregistrée avec succès.", 
      'Fermer', 
      { duration: 1500 });
    // Notify the gallery it needs to take this new photo into account:
    this.onPhotoUploadedEvent.emit(photo);
  }

  onPhotoRejected(photo: Photo) {
    this.snackBar.open(
      "Seuls les fichiers au format JPEG ou PNG peuvent être ajoutés en tant que photo dans le CEL.", 
      'Fermer', 
      { duration: 1500 });
  }


}
