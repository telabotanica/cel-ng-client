import {
    AfterViewInit,
    Component,
    ElementRef,
    OnInit,
    Output,
    EventEmitter,
    ViewChild,
    Input
} from '@angular/core';
import {
    CommonModule
} from '@angular/common';
import {
    HttpClient,
    HttpParams
} from '@angular/common/http';
import {
    MatPaginator,
    MatSort,
    MatDialogRef,
    MatTableDataSource,
    MatDialogConfig,
    MatSidenav,
    MatSnackBar,
    MatDialog
}
from '@angular/material';
import {
    tap
} from 'rxjs/operators';
import {
    merge
} from 'rxjs/observable/merge';
import {
    fromEvent
} from 'rxjs/observable/fromEvent';
import {
    SelectionModel
} from '@angular/cdk/collections';

import {
    OccurrencesDataSource
} from '../../../services/occurrence/occurrences.datasource';
import {
    OccurrenceFilters
} from '../../../model/occurrence/occurrence-filters.model';
import {
    Occurrence
} from '../../../model/occurrence/occurrence.model';
import {
    ImportDialogComponent
} from '../../../components/occurrence/import-dialog/import-dialog.component';
import {
    ConfirmDialogComponent
} from '../../../components/occurrence/confirm-dialog/confirm-dialog.component';
import {
    DeviceDetectionService
} from '../../../services/commons/device-detection.service';
import {
    BinaryDownloadService
} from '../../../services/commons/binary-download.service';
import { ProfileService } from '../../../services/profile/profile.service';
import { TokenService } from '../../../services/commons/token.service';
import { BaseComponent } from '../../generic/base-component/base.component';
import {
    NavigationService
} from '../../../services/commons/navigation.service';

@Component({
    selector: 'app-occurrence-grid',
    templateUrl: './occurrence-grid.component.html',
    styleUrls: ['./occurrence-grid.component.css']
})
export class OccurrenceGridComponent extends BaseComponent implements AfterViewInit {

    // Ids of the columns to be displayed:
    displayedColumns = [];
    private displayedColumnsForMobiles = ['userSciName', 'dateObserved'];
    private displayedColumnsForTablet = ['select', 'userSciName', 'dateObserved', 'locality'];
    private displayedColumnsForDesktop = [
        'select', 'userSciName', 'dateObserved', 'locality', 'isPublic',
        'id', 'identiplanteScore'
    ];
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild('drawer') detailDrawer: any;
    @Output() showFilterEvent = new EventEmitter();
    isMobile = false;
    isTablet = false;
    // The occ the luser wants to see the detail of used to feed the detail
    // component input:
    occUnderSpotlight: Occurrence;

    private _occFilters: OccurrenceFilters;

    // Instanciate SelectionModel with multiselection allowed and no row
    // selected at startup:
    selection = new SelectionModel < Occurrence > (true, []);

    @Input() set occFilters(newOccFilters: OccurrenceFilters) {

        if (newOccFilters !== null) {
            this.paginator.pageIndex = 0;
            this._occFilters = newOccFilters;
            this.refreshGrid();
        }
    }

    // @refactor Would using a single one to hold all three dialog be ok?
    constructor(
        protected _navigationService: NavigationService,
    protected _tokenService: TokenService,
    protected _profileService: ProfileService,
        public dataSource: OccurrencesDataSource,
        private importDialog: MatDialog,
        private confirmBulkDeleteDialog: MatDialog,
        private confirmBulkPublishDialog: MatDialog,
        private confirmBulkUnpublishDialog: MatDialog,
        public snackBar: MatSnackBar,
        private deviceDetectionService: DeviceDetectionService,
        private dldService: BinaryDownloadService) {

      super(
        _tokenService,
        _navigationService,
        _profileService,
        deviceDetectionService);

        this.setupResponsive();
    }

    protected setupResponsive() {

        // @responsive: sets public variable + sets the array of columns
        //              to display:

        this.deviceDetectionService.detectTablet().subscribe(result => {
            this.isTablet = result.matches;
            this.displayedColumns = this.isTablet ?
                this.displayedColumnsForTablet : this.displayedColumnsForDesktop;
        });
        this.deviceDetectionService.detectDevice().subscribe(result => {
            this.isMobile = result.matches;
            this.displayedColumns = this.isMobile ?
                this.displayedColumnsForMobiles : this.displayedColumnsForDesktop;
        });


    }

    ngOnInit() {
        super.ngOnInit();
        // disabled because of redondant call
        // this.dataSource.loadOccurrences('', '', 0, 10);
    }

    showFilters() {
        this.showFilterEvent.emit();
    }


    ngAfterViewInit() {
        // Reset the paginator when sort is triggered:
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

        // Refresh the grid on sort/paginate events:
        merge(this.sort.sortChange, this.paginator.page).pipe(
                tap(() => {
                    this.refreshGrid();
                })
            )
            .subscribe();
    }

    private refreshGrid() {
        this.selection.clear();
        this.dataSource.loadOccurrences(
            this.sort.active,
            this.sort.direction,
            this.paginator.pageIndex,
            this.paginator.pageSize,
            this._occFilters);

    }

    getSelectedCount() {
        return this.selection.selected.length;
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.occurrencesSubject.getValue().length;

        return numSelected == numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        this.isAllSelected() ?
            this.selection.clear() :
            this.dataSource.occurrencesSubject.getValue().forEach(row => this.selection.select(row));
    }

    openImportDialog() {

        const dialogConfig = this.buildDialogConfig();
        const importDialogRef = this.importDialog.open(ImportDialogComponent, dialogConfig);

        importDialogRef
            .afterClosed()
            .subscribe(file => {
                if (file) {
                    this.importSpreadsheet(file);
                }
            });
    }

    openConfirmBulkDeleteDialog() {

        const dialogConfig = this.buildDialogConfig();
        dialogConfig.data = 'Supprimer la/les observation(s) ?';
        const confirmBulkDeleteDialogRef = this.importDialog.open(ConfirmDialogComponent, dialogConfig);

        confirmBulkDeleteDialogRef
            .afterClosed()
            .subscribe(response => {
                if (response == true) {
                    this.bulkDelete();
                }
            });
    }

    openConfirmBulkUnpublishDialog() {

        const dialogConfig = this.buildDialogConfig();
        dialogConfig.data = 'Rendre privées la/les observations ? Elles ne seront visibles que par vous-mêmes.';
        const confirmBulkUnpublishDialogRef = this.importDialog.open(ConfirmDialogComponent, dialogConfig);

        confirmBulkUnpublishDialogRef
            .afterClosed()
            .subscribe(response => {
                if (response == true) {
                    this.bulkUnpublish();
                }
            });
    }

    openConfirmBulkPublishDialog() {

        const dialogConfig = this.buildDialogConfig();
        dialogConfig.data = 'Rendre publiques la/les observations ? Elles seront visibles par les autres telabotanistes sur le site de Tela Botanica. Cela ne sera effectif que pour les observations dont la localisation, la date et la certitude d’identification ont été renseignées.';
        const confirmBulkPublishDialogRef = this.importDialog.open(ConfirmDialogComponent, dialogConfig);

        confirmBulkPublishDialogRef
            .afterClosed()
            .subscribe(response => {
                if (response == true) {
                    this.bulkPublish();
                }
            });
    }

    buildDialogConfig() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = true;
        dialogConfig.hasBackdrop = true;
        return dialogConfig;
    }

    bulkPublish() {
        const occz = this.getSelectedOccurrences();
        const privateOccz = occz.filter(occ => (occ.isPublic == false));
        const privateOccIdz = privateOccz.map(function(occurrence) {
            return occurrence.id;
        });
        this.dataSource.bulkReplace(privateOccIdz, {
            isPublic: true
        }).subscribe(
            data => {
                let nbOfPublishedOccz = 0;
                for (const d of data) {
                    if (d[Object.keys(d)[0]].message.isPublic == true) {
                        nbOfPublishedOccz++;
                    }
                }
                let msg;
                if (nbOfPublishedOccz > 0) {
                    msg = 'Les observations complètes ont été publiées avec succès';
                } else {
                    msg = 'Observation(s) incomplète(s) : aucune observation publiée. Consulter l’aide pour plus d’informations sur les conditions de publication.';
                }
                this.snackBar.open(
                    msg,
                    'Fermer', {
                        duration: 3500
                    });
                this.refresh();

            },
            error => this.snackBar.open(
                'Une erreur est survenue. ' + error,
                'Fermer', {
                    duration: 3500
                })
        );
    }

    bulkEdit() {
        const ids = this.getSelectedIds();
        let strIds = '';
        for (const id of ids) {
            strIds += id;
            strIds += ',';
        }
        // Remove the trailing comma:
        strIds = strIds.substring(0, strIds.length - 1);
      this.navigateToMultiEditOccurrenceForm(strIds);
    }

    bulkUnpublish() {
        const ids = this.getSelectedIds();
        this.dataSource.bulkReplace(ids, {
            isPublic: false
        }).subscribe(
            data => {
                this.snackBar.open(
                    'Les observations ont été dépubliées avec succès.',
                    'Fermer', {
                        duration: 3500
                    });
                this.refresh();

            },
            error => this.snackBar.open(
                'Une erreur est survenue. ' + error,
                'Fermer', {
                    duration: 3500
                })
        );
    }

    private getSelectedIds() {
        return this.selection.selected.map(function(occurrence) {
            return occurrence.id;
        });
    }

    private getSelectedOccurrences() {
        return this.selection.selected;
    }

    doExport() {
        if ( ! this._occFilters ) {
            this._occFilters = new OccurrenceFilters();
        }
        this._occFilters.ids = this.getSelectedIds();

      this.snackBar.open(
        'Génération de l’export en cours, merci de votre patience :)',
        'Fermer',
        { duration: 3500 });

        this.dataSource.export(this._occFilters).subscribe(
          data => this.dldService.downloadBinary(data, 'text/csv', 'cel-export-'),
          () => this.snackBar.open(
            'Une erreur est survenue durant la génération de l’export.',
            'Fermer',
            { duration: 3500 })
        );
    }

    bulkDelete() {

        const ids = this.getSelectedIds();
        this.dataSource.bulkRemove(ids).subscribe(
            () => {
                this.snackBar.open(
                    'Les observations ont été supprimées avec succès.',
                    'Fermer', {
                        duration: 3500
                    });
                this.clearSelection();
                this.refresh();

            },
            error => this.snackBar.open(
                'Une erreur est survenue. ' + error,
                'Fermer', {
                    duration: 3500
                })
        );
    }

    generatePdfEtiquette() {
        this.snackBar.open(
            'Génération des étiquettes en cours, merci de votre patience :)',
            'Fermer',
            { duration: 3500 });

        const ids = this.getSelectedIds();
        this.dataSource.generatePdfEtiquette(ids).subscribe(
            data => this.dldService.downloadBinary(data, 'application/pdf', 'cel-etiquettes-'),
            () => this.snackBar.open(
                'Une erreur est survenue durant la génération des étiquettes.',
                'Fermer',
                { duration: 3500 })
        );
    }

    clearSelection() {
        this.selection.clear();
    }

    refresh() {
        this.refreshGrid();
    }

    importSpreadsheet(file: File) {
        const snackBarRef = this.snackBar.open('Import en cours. Cela peut prendre un certain temps.', 'Fermer', {
            duration: 3500
        });

        this.dataSource.importSpreadsheet(file).subscribe(
            data => {
                this.snackBar.open(
                    'Les observations ont été importées avec succès.',
                    'Fermer', {
                        duration: 3500
                    });
                this.refresh();

            },
            error => this.snackBar.open(
                'Une erreur est survenue. ' + error,
                'Fermer', {
                    duration: 3500
                })
        );
    }

    translateBoolean(bool) {
        return bool ? 'oui' : 'non';
    }

    toogleDetailSlideNav(occ: Occurrence, event) {
        if (occ != null) {
            this.occUnderSpotlight = occ;
        }
        // This is a dirty hack but couldn't find a solution to disable opening
        // occ detail when clicking in the selection column outside of check boxes.
        // Event propagation was only partly blocked.
        if (event.target.className != 'mat-row ng-star-inserted') {
            if (this.detailDrawer.opened) {
                this.detailDrawer.close();
            } else {
                this.detailDrawer.open();
            }
        }
    }

    onCloseFilterEvent() {
        this.detailDrawer.close();
    }

    _closeDetailDrawer() {
        this.detailDrawer.close();
    }

    onOccurrenceDeletedEvent() {
        this._closeDetailDrawer();
        this.refresh();
    }

}
