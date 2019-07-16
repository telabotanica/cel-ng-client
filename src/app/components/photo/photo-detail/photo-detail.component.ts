import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter
} from '@angular/core';
import {
    Router,
    ActivatedRoute
} from "@angular/router";
import {
    Observable
} from "rxjs/Observable";
import {
    Subscription
} from 'rxjs/Subscription';
import {
    MatDialogRef,
    MatDialogConfig,
    MatDialog
} from "@angular/material";

import {
    TbLog
} from "tb-tag-lib/lib/_models/tb-log.model";

import {
    environment
} from '../../../../environments/environment';
import {
    Photo
} from "../../../model/photo/photo.model";
import {
    PhotoRotation
} from "../../../model/photo/photo-rotation.model";
import {
    PhotoService
} from "../../../services/photo/photo.service";
import {
    PhotoRotationService
} from "../../../services/photo/photo-rotation.service";
import {
    NotificationService
} from "../../../services/commons/notification.service";
import {
    DeviceDetectionService
} from "../../../services/commons/device-detection.service";
import {
    PhotoShareDialogComponent
} from "../photo-share-dialog/photo-share-dialog.component";
import {
    PhotoLinkOccurrenceDialogComponent
} from '../photo-link-occurrence-dialog/photo-link-occurrence-dialog.component';
import {
    PhotoDisplayDialogComponent
} from '../photo-display-dialog/photo-display-dialog.component';
import {
    ConfirmDialogComponent
} from "../../../components/occurrence/confirm-dialog/confirm-dialog.component";

@Component({
    selector: 'app-photo-detail',
    templateUrl: './photo-detail.component.html',
    styleUrls: ['./photo-detail.component.css']
})
export class PhotoDetailComponent {

    id: number;
    photo: Photo;
    isMobile: boolean = false;
    basicTags: Array < any > = environment.photoTagLib.basicTags;
    baseUrl: string = environment.api.tagLibBaseUrl;

    private _timestamp: number;
    private _shareDialogRef: MatDialogRef < PhotoShareDialogComponent > ;
    private _linkToOccDialogRef: MatDialogRef < PhotoLinkOccurrenceDialogComponent > ;
    private _photoDisplayDialogRef: MatDialogRef < PhotoDisplayDialogComponent > ;

    private static readonly _confirmDeletionMsg: string = 'Supprimer la/les photo(s) ?';
    private static readonly _photoRotatedOkMsg: string = 'La photo a été pivotée avec succès.';
    private static readonly _occLinkedOkMsg: string = "La photo et l’observation ont bien été liées.";
    private static readonly _occUnlinkedOkMsg: string = "Le lien entre la photo et l’observation a bien été supprimé.";
    private static readonly _photoDeletedOkMsg: string = "La photo a été supprimée avec succès.";
    private static readonly _errorMsg: string = "Une erreur est survenue.";

    @Output() closeEvent = new EventEmitter();
    @Input()
    set photoToDisplay(photo: Photo) {
        this.photo = photo;
    }

    constructor(
        private dataService: PhotoService,
        private _notifService: NotificationService,
        private _deviceDetectionService: DeviceDetectionService,
        private _photoRotationService: PhotoRotationService,
        private confirmDialog: MatDialog,
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private router: Router) {

        _deviceDetectionService.detectDevice().subscribe(result => {
            this.isMobile = result.matches;
        });

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

        this.dataService.patch(this.photo.id, {
            occurrence: {
                id: occurrence.id
            }
        }).subscribe(
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
        this.dataService.patch(this.photo.id, {
            occurrence: null
        }).subscribe(
            data => {
                this.photo.occurrence = null;
                this._notifService.notify(PhotoDetailComponent._occUnlinkedOkMsg);
            },
            error => this._notifService.notifyError(PhotoDetailComponent._errorMsg + ' ' + error)
        );
    }

    private downloadZipInBrowser(data: any) {
        var blob = new Blob([data], {
            type: "application/zip"
        });
        var url = window.URL.createObjectURL(blob);
        var pwa = window.open(url);
        //@todo use an angular material dialog
        if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
            alert('Merci de désactiver votre bloqueur de popups. Il empêche le téléchargement du fichier des étiquettes.');
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
        dialogConfig.data = PhotoDetailComponent._confirmDeletionMsg;
        let confirmDialogRef = this.confirmDialog.open(ConfirmDialogComponent, dialogConfig);

        confirmDialogRef
            .afterClosed()
            .subscribe(response => {
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
                this.close();
            },
            error => this._notifService.notifyError(PhotoDetailComponent._errorMsg + ' ' + error)
        );
    }

    close() {
        this.closeEvent.emit();
    }

    public getPhotoUrl() {
        if (this._timestamp) {
            return this.photo.url + '?' + this._timestamp;
        }
        return this.photo.url;
    }


    private _refreshPhoto() {
        this._timestamp = (new Date()).getTime();
    }

    rotate() {
        this._photoRotationService.post(this.photo.id).subscribe(
            data => {
                this._refreshPhoto();
                this._notifService.notify(PhotoDetailComponent._photoRotatedOkMsg);
            },
            error => this._notifService.notifyError(PhotoDetailComponent._errorMsg + ' ' + error)
        );
    }

}
