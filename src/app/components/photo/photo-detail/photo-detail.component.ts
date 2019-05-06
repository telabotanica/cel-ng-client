import { Component, OnInit } from '@angular/core';
import { 
  Router, ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';
import { 
  MatDialogRef, 
  MatDialogConfig, 
  MatDialog } from "@angular/material";

import { TbLog } from "tb-tag-lib/lib/_models/tb-log.model";

import { environment } from '../../../../environments/environment';
import { Photo } from "../../../model/photo/photo.model";
import { PhotoService } from "../../../services/photo/photo.service";
import { NotificationService } from "../../../services/commons/notification.service";
import { PhotoShareDialogComponent } from "../photo-share-dialog/photo-share-dialog.component";
import { PhotoLinkOccurrenceDialogComponent } from '../photo-link-occurrence-dialog/photo-link-occurrence-dialog.component';
import { PhotoDisplayDialogComponent } from '../photo-display-dialog/photo-display-dialog.component';
import { ConfirmDialogComponent } from "../../../components/occurrence/confirm-dialog/confirm-dialog.component";

@Component({
  selector: 'app-photo-detail',
  templateUrl: './photo-detail.component.html',
  styleUrls: ['./photo-detail.component.css']
})
export class PhotoDetailComponent implements OnInit {

  id: number;
  photo: Photo;
  private subscription: Subscription;
  private _shareDialogRef: MatDialogRef<PhotoShareDialogComponent>;
  private _linkToOccDialogRef: MatDialogRef<PhotoLinkOccurrenceDialogComponent>;
  private _photoDisplayDialogRef: MatDialogRef<PhotoDisplayDialogComponent>;
  basicTags: Array<any> = environment.photoTagLib.basicTags;
  baseUrl: string = environment.api.tagLibBaseUrl;
  private _confirmDeletionMsg: string = 'Supprimer la/les photo(s) ?';

  static readonly _occLinkedOkMsg:string = "La photo et l’observation ont bien été liées.";
  static readonly _occUnlinkedOkMsg:string = "Le lien entre la photo et l’observation a bien été supprimé.";
  static readonly _photoDeletedOkMsg:string = "La photo a été supprimée avec succès.";
  static readonly _errorMsg:string = "Une erreur est survenue.";

  constructor(
    private dataService: PhotoService, 
    private _notifService: NotificationService,
    private confirmDialog: MatDialog, 
    private route: ActivatedRoute,
    private dialog: MatDialog, 
    private router: Router) {}

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
    this._shareDialogRef = this.dialog.open(PhotoShareDialogComponent, dialogConfig);
    this._shareDialogRef.afterClosed().subscribe();
  }

  linkToOccurrence(occurrence) {

    this.dataService.patch(this.photo.id, {occurrence:{id:occurrence.id}}).subscribe(
      data => {
	this.photo.occurrence = occurrence;
	this._notifService.notify(PhotoDetailComponent._occLinkedOkMsg);
      },
      error => this._notifService.notifyError(PhotoDetailComponent._errorMsg + ' ' + error)
    );
  }

  openLinkOccurrenceDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.data = this.photo;
    dialogConfig.hasBackdrop = true;
    this._linkToOccDialogRef = this.dialog.open(PhotoLinkOccurrenceDialogComponent, dialogConfig);

    this._linkToOccDialogRef
      .afterClosed()
      .subscribe(
        occ => this.linkToOccurrence(occ)
    );

  }


  unlinkOccurrence() {
    this.dataService.patch(this.photo.id, {occurrence:null}).subscribe(
      data => {
	this.photo.occurrence = null;
	this._notifService.notify(PhotoDetailComponent._occUnlinkedOkMsg);
      },
      error => this._notifService.notifyError(PhotoDetailComponent._errorMsg + ' ' + error)
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
    this._photoDisplayDialogRef = this.dialog.open(PhotoDisplayDialogComponent, dialogConfig);

    this._photoDisplayDialogRef
        .afterClosed()
        .subscribe();
  }

  download() {
      let id = this.photo.id;
      this.dataService.download([this.photo.id]).subscribe(
          data => {
            this.downloadZipInBrowser(data);
          },
          error => this._notifService.notifyError(PhotoDetailComponent._errorMsg + ' ' + error)
      );
  }

  buildDialogConfig() {
    let dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.hasBackdrop = true;
    return dialogConfig;
  }

  openConfirmDeletionDialog(value) {

    let dialogConfig = this.buildDialogConfig();
    dialogConfig.data = this._confirmDeletionMsg;
    let confirmDialogRef = this.confirmDialog.open(ConfirmDialogComponent, dialogConfig);

    confirmDialogRef
      .afterClosed()
      .subscribe( response => {
          if (response == true) {
            this.delete();
          }
      });
  }

  delete() {
      let id = this.photo.id;
      this.dataService.delete(id).subscribe(
          data => {
            this._notifService.notify(PhotoDetailComponent._photoDeletedOkMsg);
            this._navigateToPhotoGallery();
          },
          error => this._notifService.notifyError(PhotoDetailComponent._errorMsg + ' ' + error)
      );
  }

  _navigateToPhotoGallery() {
    this.router.navigate(['/photo-ui']);
  }

  logTagLibMessages(log: TbLog) {
    if (log.type === 'info') {
      // tslint:disable-next-line:no-console
      console.info(log.message_fr);
    } else if (log.type === 'success') {
      console.log(log.message_fr);
    } else if (log.type === 'warning') {
      console.warn(log.message_fr);
    } else if (log.type === 'error') {
      console.error(log.message_fr);
    }
  }

}
