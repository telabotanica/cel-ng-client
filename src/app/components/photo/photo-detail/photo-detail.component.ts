import { Component, OnInit } from '@angular/core';
import { 
  Router, ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';
import { 
  MatDialogRef, 
  MatDialogConfig, 
  MatSnackBar,
  MatDialog } from "@angular/material";

import { Photo } from "../../../model/photo/photo.model";
import { PhotoService } from "../../../services/photo/photo.service";
import { PhotoShareDialogComponent } from "../photo-share-dialog/photo-share-dialog.component";
import { PhotoLinkOccurrenceDialogComponent } from '../photo-link-occurrence-dialog/photo-link-occurrence-dialog.component';
import { PhotoDisplayDialogComponent } from '../photo-display-dialog/photo-display-dialog.component';

@Component({
  selector: 'app-photo-detail',
  templateUrl: './photo-detail.component.html',
  styleUrls: ['./photo-detail.component.css']
})
export class PhotoDetailComponent implements OnInit {

  id: number;
  photo: Photo;
  private subscription: Subscription;
  shareDialogRef: MatDialogRef<PhotoShareDialogComponent>;
  linkToOccDialogRef: MatDialogRef<PhotoLinkOccurrenceDialogComponent>;
  photoDisplayDialogRef: MatDialogRef<PhotoDisplayDialogComponent>;

  constructor(
    private dataService:PhotoService, 
    private route: ActivatedRoute,
    private dialog: MatDialog, 
    private router: Router,
    public snackBar: MatSnackBar) {}

  ngOnInit() {
    this.subscription = this.route.params.subscribe(params => {
       this.id = parseInt(params['id']);
       this.dataService.get(this.id).subscribe( 
          photo => {this.photo = photo;}
       );
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  openShareDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.data = this.photo.url;
    dialogConfig.hasBackdrop = true;
    this.shareDialogRef = this.dialog.open(PhotoShareDialogComponent, dialogConfig);

    this.shareDialogRef
        .afterClosed()
        .subscribe();
  }

  linkToOccurrence(occurrence) {

    this.dataService.patch(this.photo.id, {occurrence:{id:occurrence.id}}).subscribe(
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

  openLinkOccurrenceDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.data = this.photo;
    dialogConfig.hasBackdrop = true;
    this.linkToOccDialogRef = this.dialog.open(PhotoLinkOccurrenceDialogComponent, dialogConfig);

    this.linkToOccDialogRef
      .afterClosed()
      .subscribe(
        occ => this.linkToOccurrence(occ)
    );

  }


  
  private downloadZipInBrowser(data: any) {
    var blob = new Blob([data], { type: "application/zip"});
    var url = window.URL.createObjectURL(blob);
    var pwa = window.open(url);
    //@todo use an angular material dialog
    if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
        alert( 'Merci de désactiver votre bloqueur de popups. Il empêche le téléchargement du fichier des étiquettes.');
    }
  }

  viewBigger() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.data = this.photo;
    dialogConfig.hasBackdrop = true;
    this.photoDisplayDialogRef = this.dialog.open(PhotoDisplayDialogComponent, dialogConfig);

    this.photoDisplayDialogRef
        .afterClosed()
        .subscribe();

  }

  download() {
      let id = this.photo.id;
      this.dataService.download([this.photo.id]).subscribe(
          data => {
            this.downloadZipInBrowser(data);

          },
          error => this.snackBar.open(
              'Une erreur est survenue. ' + error, 
              'Fermer', 
              { duration: 1500 })
      );
  }

  delete() {
      let id = this.photo.id;
      this.dataService.delete(id).subscribe(
          data => {
              this.snackBar.open(
              "L'observation a été supprimée avec succès.", 
              "Fermer", 
              { duration: 1500 });
              this.router.navigate(['/photo-ui']);

          },
          error => this.snackBar.open(
              'Une erreur est survenue. ' + error, 
              'Fermer', 
              { duration: 1500 })
      );
  }

}
