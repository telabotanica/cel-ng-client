import {
    Component,
    ElementRef,
    AfterViewInit,
    Output,
    EventEmitter,
    Input,
    ViewChild
} from '@angular/core';
import {
    Observable
} from "rxjs/Observable";
import {
    tap
} from 'rxjs/operators';
import {
    Subscription
} from 'rxjs/Subscription';
import {
    environment
} from '../../../../environments/environment';
import {
    MatPaginator,
    MatSort,
    MatDialogRef,
    MatTableDataSource,
    MatDialogConfig,
    MatSnackBar,
    MatDialog
} from "@angular/material";
import * as Leaflet from 'leaflet';

import {
    FileData
} from "tb-dropfile-lib/lib/_models/fileData.d";
import {
    PhotoService
} from "../../../services/photo/photo.service";
import {
    Photo
} from "../../../model/photo/photo.model";
import {
    PhotoFilters
} from "../../../model/photo/photo-filters.model";
import {
    PhotoLinkOccurrenceDialogComponent
} from '../photo-link-occurrence-dialog/photo-link-occurrence-dialog.component';
import {
    ConfirmDialogComponent
} from "../../../components/occurrence/confirm-dialog/confirm-dialog.component";
import {
    AddPhotoDialogComponent
} from "../../../components/photo/add-photo-dialog/add-photo-dialog.component";
import {
    DeviceDetectionService
} from "../../../services/commons/device-detection.service";
import {
    BinaryDownloadService
} from "../../../services/commons/binary-download.service";
import { BaseComponent } from '../../generic/base-component/base.component';
import { ProfileService } from "../../../services/profile/profile.service";
import { TokenService } from "../../../services/commons/token.service";
import {
    NavigationService
} from "../../../services/commons/navigation.service";

@Component({
    selector: 'app-photo-gallery',
    templateUrl: './photo-gallery.component.html',
    styleUrls: ['./photo-gallery.component.css']
})
export class PhotoGalleryComponent extends BaseComponent implements AfterViewInit {

    private subscription: Subscription;
    resources: Photo[];
    // The ids of selected photos:
    selected = [];
    _filters: PhotoFilters;
    _imageFakeParam = (new Date()).getTime();
    private sortBy;
    private sortDirection;
    totalNbrOfHits: number = 0;
    linkToOccDialogRef: MatDialogRef < PhotoLinkOccurrenceDialogComponent > ;
    addPhotoDialogRef: MatDialogRef < AddPhotoDialogComponent > ;
    @Output() showFilterEvent = new EventEmitter();
    private _confirmDeletionMsg: string = 'Supprimer la/les photo(s) ?';
    // Mobile or desktop device?
    public isMobile: boolean = false;
    // The photo the luser wants to see the detail of - used to feed the detail
    // component input:
    photoUnderSpotlight: Photo;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild('drawer') detailDrawer: any;

    constructor(
        private dataService: PhotoService,
        private confirmDeletionDialog: MatDialog,
        private dialog: MatDialog,
        public snackBar: MatSnackBar,
        protected _deviceDetectionService: DeviceDetectionService,
        protected _navigationService: NavigationService,
    protected _tokenService: TokenService,
    protected _profileService: ProfileService,
        private dldService: BinaryDownloadService) {


      super(
        _tokenService,
        _navigationService,
        _profileService,
        _deviceDetectionService);

    }

    ngAfterViewInit() {
        // Refresh the gallery on paginate events:
        this.paginator.page.pipe(
            tap(() => {
                this.refresh();
            })
        ).subscribe();
    }

    refresh() {
        this._emptySelection();
        this._imageFakeParam = (new Date()).getTime();
        this.loadData();
    }

    _emptySelection() {
        this.selected = [];
    }


    showFilters() {
        this.showFilterEvent.emit();
    }

    @Input() set filters(photoFilters: PhotoFilters) {
        this._filters = photoFilters;
        this.paginator.pageIndex = 0;
        if (photoFilters !== null) {
            this._emptySelection();
            this.loadData();
        }
    }


    refreshCountWithFilters(filters: PhotoFilters) {
        this.dataService.findCount(filters).subscribe(
            resp => this.totalNbrOfHits = parseInt(resp.headers.get('X-count')));
    }

    loadData() {
        this.subscription = this.dataService.getCollection(
            this.sortBy,
            this.sortDirection,
            this.paginator.pageIndex,
            this.paginator.pageSize,
            this._filters).subscribe(
            photos => {
                this.resources = photos;
            }
        );
        this.refreshCountWithFilters(this._filters);
    }

    openConfirmDeletionDialog(value) {

        let dialogConfig = this.buildDialogConfig();
        dialogConfig.data = this._confirmDeletionMsg;
        let confirmDeletionDialogRef = this.confirmDeletionDialog.open(ConfirmDialogComponent, dialogConfig);

        confirmDeletionDialogRef
            .afterClosed()
            .subscribe(response => {
                if (response == true) {
                    this.bulkDelete();
                }
            });
    }

    openAddPhotoDialog() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = true;
        dialogConfig.hasBackdrop = true;
        this.addPhotoDialogRef = this.dialog.open(AddPhotoDialogComponent, dialogConfig);

        const sub = this.addPhotoDialogRef.componentInstance.onPhotoUploadedEvent.subscribe(photo => {
            this.onPhotoUploaded(photo);
        });


        this.addPhotoDialogRef
            .afterClosed()
            .subscribe(
                //occ => this.linkToOccurrence(occ)
            );

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
        this.resources.unshift(photo);
    }


    onPhotoUploaded(photo: any) {
        this.addPhoto(photo);
        //this.refresh();
    }


    private _downloadZipInBrowser(data: any) {
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

    bulkDownload() {
        let ids = this.selected;
        let newWindow = window.open(); 
        this.dataService.download(ids).subscribe(
            data => {
              
                this.dldService.downloadBinary(newWindow, data,  "application/zip");

            },
            error => this.snackBar.open(
                'Une erreur est survenue. ' + error,
                'Fermer', {
                    duration: 1500
                })
        );
    }

    isSelected(photo) {
        return (this.selected.includes(photo.id));
    }

    onPhotoSelect(photo) {
        if (this.isSelected(photo)) {
            this.selected.splice(this.selected.indexOf(photo.id), 1);
        } else {
            this.selected.push(photo.id);
        }
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
                    'Fermer', {
                        duration: 1500
                    });
                for (let id of ids) {
                    console.debug(id);
                    console.debug(this.resources);
                    this.resources = this.resources.filter(photo => photo.id !== id);
                }
                this.selected = [];
            },
            error => this.snackBar.open(
                'Une erreur est survenue. ' + error,
                'Fermer', {
                    duration: 1500
                })
        );
    }



    linkToOccurrence(occurrence) {

        let ids = this.selected;
        this.dataService.bulkReplace(ids, {
            occurrence: {
                id: occurrence.id
            }
        }).subscribe(
            data => {
                this.snackBar.open(
                    "La photo et l’observation ont bien été liées.",
                    "Fermer", {
                        duration: 1500
                    });
            },
            error => this.snackBar.open(
                'Une erreur est survenue. ' + error,
                'Fermer', {
                    duration: 1500
                })
        );
    }


    // add a fake param to URL to allow to refresh images after rotation:
    public generateDynamicPhotoUrl(url) {
            return url + '?' + this._imageFakeParam;
    }


    toogleDetailSlideNav(photo: Photo) {
        if (photo != null) {
            this.photoUnderSpotlight = photo;
        }
        if (this.detailDrawer.opened) {
            this.detailDrawer.close();
        } else {
            this.detailDrawer.open();
        }
    }

    onCloseFilterEvent() {
        this.detailDrawer.close();
        this.refresh();
    }

}
