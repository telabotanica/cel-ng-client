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
import { CommonModule 
} from '@angular/common';
import { 
  Router, ActivatedRoute 
} from "@angular/router";
import { 
  HttpClient, HttpParams 
} from "@angular/common/http";
import { 
  MatPaginator, 
  MatSort, 
  MatDialogRef,
  MatTableDataSource, 
  MatDialogConfig, 
  MatSidenav,
  MatSnackBar,
  MatDialog } 
from "@angular/material";
import { 
  debounceTime, 
  distinctUntilChanged, 
  startWith, 
  tap, 
  delay } from 'rxjs/operators';
import { merge } from "rxjs/observable/merge";
import { fromEvent } from 'rxjs/observable/fromEvent';
import { SelectionModel } from '@angular/cdk/collections';

import { OccurrencesDataSource } from "../../../services/occurrence/occurrences.datasource";
import { OccurrenceFilters }  from "../../../model/occurrence/occurrence-filters.model";
import { Occurrence } from "../../../model/occurrence/occurrence.model";
import { ImportDialogComponent } from "../../../components/occurrence/import-dialog/import-dialog.component";
import { ConfirmDialogComponent } from "../../../components/occurrence/confirm-dialog/confirm-dialog.component";
import { DeviceDetectionService } from "../../../services/commons/device-detection.service";

@Component({
  selector: 'app-occurrence-grid',
  templateUrl: './occurrence-grid.component.html',
  styleUrls: ['./occurrence-grid.component.css']
})
export class OccurrenceGridComponent implements AfterViewInit, OnInit {

  // Ids of the columns to be displayed:
  displayedColumns = [];
  private displayedColumnsForMobiles = ["userSciName", "dateObserved"]; 
  private displayedColumnsForDesktop = [
    "select", "userSciName", "dateObserved", "locality", "isPublic", 
    "id", "identiplanteScore"];
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
  selection = new SelectionModel<Occurrence>(true, []);

  @Input() set occFilters(newOccFilters: OccurrenceFilters) {

    if (  newOccFilters !== null) {
      this.paginator.pageIndex = 0;
      this._occFilters = newOccFilters;
      this.refreshGrid();
    }
  }

  // @refactor Would using a single one to hold all three dialog be ok? 
  constructor(
    public dataSource:                  OccurrencesDataSource, 
    private importDialog:               MatDialog, 
    private confirmBulkDeleteDialog:    MatDialog, 
    private confirmBulkPublishDialog:   MatDialog, 
    private confirmBulkUnpublishDialog: MatDialog, 
    public  snackBar:                   MatSnackBar,
    private deviceDetectionService:     DeviceDetectionService,
    private router: Router) {
 
    this.setupResponsive();
  }

  private setupResponsive() {
    
      // @responsive: sets public variable + sets the array of columns 
      //              to display:
      this.deviceDetectionService.detectDevice().subscribe(result => {
        this.isMobile = result.matches;
        this.displayedColumns = this.isMobile ? 
          this.displayedColumnsForMobiles : this.displayedColumnsForDesktop;
      });
  }

  ngOnInit() {
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
        resp => this.totalNbrOfHits = parseInt(resp.headers.get('X-count')) );
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
      .subscribe( file => {
          if ( file ) {
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
      .subscribe( response => {
          if (response == true) {
            this.bulkDelete();
          }
      });
  }

  openConfirmBulkUnpublishDialog() {

    let dialogConfig = this.buildDialogConfig();  
    dialogConfig.data = 'Dépublier la/les observation(s) ?)';
    let confirmBulkUnpublishDialogRef = this.importDialog.open(ConfirmDialogComponent, dialogConfig);
 
    confirmBulkUnpublishDialogRef
      .afterClosed()
      .subscribe( response => {
          if (response == true) {
            this.bulkUnpublish();
          }
      });
  }

  openConfirmBulkPublishDialog() {

    let dialogConfig = this.buildDialogConfig();  
    dialogConfig.data = 'Publier la/les observation(s) ? Cela ne sera effectif que pour les observations ayant les prérequis (précision, localisation et date renseignés).';
    let confirmBulkPublishDialogRef = this.importDialog.open(ConfirmDialogComponent, dialogConfig);

    confirmBulkPublishDialogRef
      .afterClosed()
      .subscribe( response => {
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
      let ids = this.getSelectedIds();
      this.dataSource.bulkReplace(ids, {isPublic: true}).subscribe(
          data => {
              this.snackBar.open(
              'Les observations complètes ont été publiées avec succès.', 
              'Fermer', 
              { duration: 1500 });
              this.refresh();

          },
          error => this.snackBar.open(
              'Une erreur est survenue. ' + error, 
              'Fermer', 
              { duration: 1500 })
      )
  }

  bulkEdit() {
      let ids = this.getSelectedIds();
      let strIds = '';
      for(let id of ids) {
          strIds += id;
          strIds += ',';
      }
      // Remove the trailing comma:
      strIds = strIds.substring(0, strIds.length-1);
      this.router.navigate(['/occurrence-collection-edit-form', strIds]);
  }

  bulkUnpublish() {
      let ids = this.getSelectedIds();
      this.dataSource.bulkReplace(ids, {isPublic: false}).subscribe(
          data => {
              this.snackBar.open(
              'Les observations ont été dépubliées avec succès.', 
              'Fermer', 
              { duration: 1500 });
              this.refresh();

          },
          error => this.snackBar.open(
              'Une erreur est survenue. ' + error, 
              'Fermer', 
              { duration: 1500 })
      )
  }

  private getSelectedIds() {
    return this.selection.selected.map(function(occurrence) {
        return occurrence.id;
      });
  }

  bulkDelete() {

      let ids = this.getSelectedIds();
      this.dataSource.bulkRemove(ids).subscribe(
          data => {
              this.snackBar.open(
              'Les observations ont été supprimées avec succès.', 
              'Fermer', 
              { duration: 1500 });
              this.clearSelection();
              this.refresh();

          },
          error => this.snackBar.open(
              'Une erreur est survenue. ' + error, 
              'Fermer', 
              { duration: 1500 })
      );
  }

  generatePdfEtiquette() {
      let ids = this.getSelectedIds();
      this.dataSource.generatePdfEtiquette(ids).subscribe(resp => {
            this.downloadPdfEtiquette(resp);
          });
  }

  private downloadPdfEtiquette(data: any) {
    var blob = new Blob([data], { type: "application/pdf"});
    var url = window.URL.createObjectURL(blob);
    var pwa = window.open(url, '_blank');
    //@todo use an angular material dialog
    if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
        alert( 'Merci de désactiver votre bloqueur de popups. Il empêche le téléchargement du fichier des étiquettes.');
    }
  }

  clearSelection() {
    this.selection.clear();
  }

  refresh() {
    this.refreshGrid();
  }

  importSpreadsheet(file: File) {
    let snackBarRef = this.snackBar.open('Import en cours. Cela peut prendre un certain temps.', 'Fermer', {
        duration: 1500
    });

    this.dataSource.importSpreadsheet(file).subscribe(
      data => {
          this.snackBar.open(
          'Les observations ont été importées avec succès.', 
          'Fermer', 
          { duration: 1500 });
          this.refresh();

      },
      error => this.snackBar.open(
          'Une erreur est survenue. ' + error, 
          'Fermer', 
          { duration: 1500 })
    ); 
  }

  translateBoolean(bool) {
      return bool ? "oui":"non";
  }

  toogleDetailSlideNav(occ: Occurrence, event) {
    if ( occ != null ) {
      this.occUnderSpotlight = occ;
    }
    // This is a dirty hack but couldn't find a solution to disable opening
    // occ detail when clicking outside of the selection check boxes
    if (event.originalTarget.className != 'mat-row ng-star-inserted') {
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


}
