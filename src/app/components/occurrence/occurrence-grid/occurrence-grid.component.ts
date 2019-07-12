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
    Router,
    ActivatedRoute
} from "@angular/router";
import {
    HttpClient,
    HttpParams
} from "@angular/common/http";
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
from "@angular/material";
import {
    tap
} from 'rxjs/operators';
import {
    merge
} from "rxjs/observable/merge";
import {
    fromEvent
} from 'rxjs/observable/fromEvent';
import {
    SelectionModel
} from '@angular/cdk/collections';

import {
    OccurrencesDataSource
} from "../../../services/occurrence/occurrences.datasource";
import {
    OccurrenceFilters
} from "../../../model/occurrence/occurrence-filters.model";
import {
    Occurrence
} from "../../../model/occurrence/occurrence.model";
import {
    ImportDialogComponent
} from "../../../components/occurrence/import-dialog/import-dialog.component";
import {
    ConfirmDialogComponent
} from "../../../components/occurrence/confirm-dialog/confirm-dialog.component";
import {
    DeviceDetectionService
} from "../../../services/commons/device-detection.service";
import {
    BinaryDownloadService
} from "../../../services/commons/binary-download.service";
import { ProfileService } from "../../../services/profile/profile.service";
import { DataUsageAgreementService } from "../../../services/commons/data-usage-agreement.service";
import { TokenService } from "../../../services/commons/token.service";
import { BaseComponent } from '../../generic/base-component/base.component';
import {
    NavigationService
} from "../../../services/commons/navigation.service";

@Component({
    selector: 'app-occurrence-grid',
    templateUrl: './occurrence-grid.component.html',
    styleUrls: ['./occurrence-grid.component.css']
})
export class OccurrenceGridComponent extends BaseComponent implements AfterViewInit {

    // Ids of the columns to be displayed:
    displayedColumns = [];
    private displayedColumnsForMobiles = ["userSciName", "dateObserved"];
    private displayedColumnsForDesktop = [
        "select", "userSciName", "dateObserved", "locality", "isPublic",
        "id", "identiplanteScore"
    ];
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild('drawer') detailDrawer: any;
    @Output() showFilterEvent = new EventEmitter();
    // The total number of occurrence instances matching _occFilters (used by 
    // the table paginator):
    totalNbrOfHits = 0;
    isMobile: boolean = false;
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
    protected _dataUsageAgreementService: DataUsageAgreementService,
        public dataSource: OccurrencesDataSource,
        private importDialog: MatDialog,
        private confirmBulkDeleteDialog: MatDialog,
        private confirmBulkPublishDialog: MatDialog,
        private confirmBulkUnpublishDialog: MatDialog,
        public snackBar: MatSnackBar,
        private deviceDetectionService: DeviceDetectionService,
        private dldService: BinaryDownloadService,
        private router: Router) {

      super(
        _tokenService,
        _navigationService,
        _profileService,
        _dataUsageAgreementService,
        deviceDetectionService,
        router);

        this.setupResponsive();
    }
/*


  downloadBinary(srcWindow, data, mimeType): void {
        var blob = new Blob([data], { type: mimeType});
        var url = window.URL.createObjectURL(blob);
        //this.router.navigate([url]);
        //Populating the file
        srcWindow.location.href = url;
  }
*/
    protected setupResponsive() {

        // @responsive: sets public variable + sets the array of columns 
        //              to display:
        this.deviceDetectionService.detectDevice().subscribe(result => {
            this.isMobile = result.matches;
            this.displayedColumns = this.isMobile ?
                this.displayedColumnsForMobiles : this.displayedColumnsForDesktop;
        });
    }

    ngOnInit() {
super.ngOnInit();
        this.refreshCount();
        this.dataSource.loadOccurrences('', '', 0, 10);
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
        this.refreshCount();

    }

    refreshCount() {
        this.refreshCountWithFilters(this._occFilters);
    }

    refreshCountWithFilters(filters: OccurrenceFilters) {
        this.dataSource.findCount(filters).subscribe(
            resp => this.totalNbrOfHits = parseInt(resp.headers.get('X-count')));
    }


    navigateToCreateOccurrenceForm() {
        this.router.navigateByUrl('/occurrence-form');
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

        let dialogConfig = this.buildDialogConfig();
        let importDialogRef = this.importDialog.open(ImportDialogComponent, dialogConfig);

        importDialogRef
            .afterClosed()
            .subscribe(file => {
                if (file) {
                    this.importSpreadsheet(file);
                }
            });
    }

    openConfirmBulkDeleteDialog() {

        let dialogConfig = this.buildDialogConfig();
        dialogConfig.data = 'Supprimer la/les observation(s) ?';
        let confirmBulkDeleteDialogRef = this.importDialog.open(ConfirmDialogComponent, dialogConfig);

        confirmBulkDeleteDialogRef
            .afterClosed()
            .subscribe(response => {
                if (response == true) {
                    this.bulkDelete();
                }
            });
    }

    openConfirmBulkUnpublishDialog() {

        let dialogConfig = this.buildDialogConfig();
        dialogConfig.data = "Rendre privées la/les observations ? Elles ne seront visibles que par vous-mêmes.";
        let confirmBulkUnpublishDialogRef = this.importDialog.open(ConfirmDialogComponent, dialogConfig);

        confirmBulkUnpublishDialogRef
            .afterClosed()
            .subscribe(response => {
                if (response == true) {
                    this.bulkUnpublish();
                }
            });
    }

    openConfirmBulkPublishDialog() {

        let dialogConfig = this.buildDialogConfig();
        dialogConfig.data = "Rendre publiques la/les observations ? Elles seront visibles par les autres telabotanistes sur le site de Tela Botanica. Cela ne sera effectif que pour les observations dont la localisation, la date et la certitude d'identification ont été renseignées.";
        let confirmBulkPublishDialogRef = this.importDialog.open(ConfirmDialogComponent, dialogConfig);

        confirmBulkPublishDialogRef
            .afterClosed()
            .subscribe(response => {
                if (response == true) {
                    this.bulkPublish();
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

    bulkPublish() {
        let occz = this.getSelectedOccurrences();
        const privateOccz = occz.filter(occ => (occ.isPublic == false));
        let privateOccIdz = privateOccz.map(function(occurrence) {
            return occurrence.id;
        });
        this.dataSource.bulkReplace(privateOccIdz, {
            isPublic: true
        }).subscribe(
            data => {
                let nbOfPublishedOccz = 0;
                for (let d of data) {
                    if (d[Object.keys(d)[0]].message.isPublic == true) {
                        nbOfPublishedOccz++;
                    }
                }
                let msg;
                if (nbOfPublishedOccz > 0) {
                    msg = 'Les observations complètes ont été publiées avec succès';
                } else {
                    msg = 'Observation(s) incomplète(s) : aucune observation publiée. Consulter l\'aide pour plus d\'informations sur les conditions de publication.';

                }
                this.snackBar.open(
                    msg,
                    'Fermer', {
                        duration: 2500
                    });
                this.refresh();

            },
            error => this.snackBar.open(
                'Une erreur est survenue. ' + error,
                'Fermer', {
                    duration: 2500
                })
        )
    }

    bulkEdit() {
        let ids = this.getSelectedIds();
        let strIds = '';
        for (let id of ids) {
            strIds += id;
            strIds += ',';
        }
        // Remove the trailing comma:
        strIds = strIds.substring(0, strIds.length - 1);
        this.router.navigate(['/occurrence-collection-edit-form', strIds]);
    }

    bulkUnpublish() {
        let ids = this.getSelectedIds();
        this.dataSource.bulkReplace(ids, {
            isPublic: false
        }).subscribe(
            data => {
                this.snackBar.open(
                    'Les observations ont été dépubliées avec succès.',
                    'Fermer', {
                        duration: 2500
                    });
                this.refresh();

            },
            error => this.snackBar.open(
                'Une erreur est survenue. ' + error,
                'Fermer', {
                    duration: 2500
                })
        )
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

        let newWindow = window.open(); 
        if ( ! this._occFilters ) {
            this._occFilters = new OccurrenceFilters();
        }
        this._occFilters.ids = this.getSelectedIds();
        this.dataSource.export(this._occFilters).subscribe(data => {
            this.dldService.downloadBinary(newWindow, data,  "text/csv");
        });


    }




    bulkDelete() {

        let ids = this.getSelectedIds();
        this.dataSource.bulkRemove(ids).subscribe(
            data => {
                this.snackBar.open(
                    'Les observations ont été supprimées avec succès.',
                    'Fermer', {
                        duration: 2500
                    });
                this.clearSelection();
                this.refresh();

            },
            error => this.snackBar.open(
                'Une erreur est survenue. ' + error,
                'Fermer', {
                    duration: 2500
                })
        );
    }

    generatePdfEtiquette() {
        let ids = this.getSelectedIds();
        let newWindow = window.open();
        this.dataSource.generatePdfEtiquette(ids).subscribe(data => {


                    this.dldService.downloadBinary(newWindow, data,  "application/pdf");
                  });

            
        
    }

    private downloadPdfEtiquette(data: any) {
        // As no way has been found to cleanly add the nice headers like Content-Disposition
        // 
        var blob = new Blob([data], {
            type: "application/pdf"
        });
        var url = window.URL.createObjectURL(blob);
        var pwa = window.open(url);
        if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
            alert('Merci de désactiver votre bloqueur de popups. Il empêche le téléchargement du fichier des étiquettes.');
        }
        //@todo use an angular material dialog

    }



    clearSelection() {
        this.selection.clear();
    }

    refresh() {
        this.refreshGrid();
    }

    importSpreadsheet(file: File) {
        let snackBarRef = this.snackBar.open('Import en cours. Cela peut prendre un certain temps.', 'Fermer', {
            duration: 2500
        });

        this.dataSource.importSpreadsheet(file).subscribe(
            data => {
                this.snackBar.open(
                    'Les observations ont été importées avec succès.',
                    'Fermer', {
                        duration: 2500
                    });
                this.refresh();

            },
            error => this.snackBar.open(
                'Une erreur est survenue. ' + error,
                'Fermer', {
                    duration: 2500
                })
        );
    }

    translateBoolean(bool) {
        return bool ? "oui" : "non";
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
