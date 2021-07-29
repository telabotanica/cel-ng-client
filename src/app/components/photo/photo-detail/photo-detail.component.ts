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
} from '@angular/router';
import {
    Observable
} from 'rxjs/Observable';
import {
    Subscription
} from 'rxjs/Subscription';
import {
    MatDialogRef,
    MatDialogConfig,
    MatDialog
} from '@angular/material';

import {
    TbLog
} from 'tb-tag-lib/lib/_models/tb-log.model';

import {
    environment
} from '../../../../environments/environment';
import {
    Photo
} from '../../../model/photo/photo.model';
import {
    PhotoRotation
} from '../../../model/photo/photo-rotation.model';
import {
    PhotoService
} from '../../../services/photo/photo.service';
import {
    PhotoRotationService
} from '../../../services/photo/photo-rotation.service';
import {
    NotificationService
} from '../../../services/commons/notification.service';
import {
    DeviceDetectionService
} from '../../../services/commons/device-detection.service';
import {
    PhotoShareDialogComponent
} from '../photo-share-dialog/photo-share-dialog.component';
import {
    PhotoLinkOccurrenceDialogComponent
} from '../photo-link-occurrence-dialog/photo-link-occurrence-dialog.component';
import {
    PhotoDisplayDialogComponent
} from '../photo-display-dialog/photo-display-dialog.component';
import {
    ConfirmDialogComponent
} from '../../../components/occurrence/confirm-dialog/confirm-dialog.component';
import {BinaryDownloadService} from '../../../services/commons/binary-download.service';

@Component({
    selector: 'app-photo-detail',
    templateUrl: './photo-detail.component.html',
    styleUrls: ['./photo-detail.component.css']
})
export class PhotoDetailComponent {
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
        private router: Router,
        private dldService: BinaryDownloadService) {

        _deviceDetectionService.detectDevice().subscribe(result => {
            this.isMobile = result.matches;
        });

    }


    private static readonly _confirmDeletionMsg: string = 'Supprimer la/les photo(s) ?';
    private static readonly _photoRotatedOkMsg: string = 'La photo a été pivotée avec succès.';
    private static readonly _occLinkedOkMsg: string = 'La photo et l’observation ont bien été liées.';
    private static readonly _occUnlinkedOkMsg: string = 'Le lien entre la photo et l’observation a bien été supprimé.';
    private static readonly _photoDeletedOkMsg: string = 'La photo a été supprimée avec succès.';
    private static readonly _downloadMsg: string = 'Génération de l’archive pour la photo en cours, merci de votre patience :)';
    private static readonly _errorMsg: string = 'Une erreur est survenue.';

    id: number;
    photo: Photo;
    isMobile = false;
    basicTags: Array < any > = environment.photoTagLib.basicTags;
    baseUrl: string = environment.api.tagLibBaseUrl;
    refreshButtonDisabled = false;

    private _timestamp: number;
    private _shareDialogRef: MatDialogRef < PhotoShareDialogComponent > ;
    private _linkToOccDialogRef: MatDialogRef < PhotoLinkOccurrenceDialogComponent > ;
    private _photoDisplayDialogRef: MatDialogRef < PhotoDisplayDialogComponent > ;

    @Output() closeEvent = new EventEmitter();

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
        const id = this.photo.id;
        this._notifService.notifyError(PhotoDetailComponent._downloadMsg);
        this.dataService.download([id]).subscribe(
            data => this.dldService.downloadBinary(data, 'application/zip', 'cel-photo-' + id + '-'),
            error => this._notifService.notifyError(PhotoDetailComponent._errorMsg + ' ' + error)
        );
    }

    buildDialogConfig() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = true;
        dialogConfig.hasBackdrop = true;
        return dialogConfig;
    }

    openConfirmDeletionDialog(value) {

        const dialogConfig = this.buildDialogConfig();
        dialogConfig.data = PhotoDetailComponent._confirmDeletionMsg;
        const confirmDialogRef = this.confirmDialog.open(ConfirmDialogComponent, dialogConfig);

        confirmDialogRef
            .afterClosed()
            .subscribe(response => {
                if (response == true) {
                    this.delete();
                }
            });
    }

    delete() {
        const id = this.photo.id;
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
            return this.photo.url.replace('O', 'M') + '?' + this._timestamp;
//            return this.photo.getMiniatureUrl() + '?' + this._timestamp;
        }
        // return this.photo.getMiniatureUrl();
        return this.photo.url.replace('O', 'M');
    }


    private _refreshPhoto() {
        this._timestamp = (new Date()).getTime();
    }

    rotate() {
        this.refreshButtonDisabled = true;
        this._photoRotationService.post(this.photo.id).subscribe(
            data => {
                this._refreshPhoto();
                this._notifService.notify(PhotoDetailComponent._photoRotatedOkMsg);
                this.refreshButtonDisabled = false;
            },
            error => {
                this._notifService.notifyError(PhotoDetailComponent._errorMsg + ' ' + error);
                this.refreshButtonDisabled = false;
            }
        );
    }

}
