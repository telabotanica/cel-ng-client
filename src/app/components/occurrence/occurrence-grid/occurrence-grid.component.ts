import { 
  AfterViewInit, 
  Component, 
  ElementRef, 
  OnInit, 
  ViewChild, 
  Input } from '@angular/core';
import { 
  Router, ActivatedRoute } from "@angular/router";
import { 
  HttpClient, HttpParams } from "@angular/common/http";
import { 
  MatPaginator, 
  MatSort, 
  MatDialogRef,
  MatTableDataSource, 
  MatDialogConfig, 
  MatSidenav,
  MatSnackBar,
  MatDialog } from "@angular/material";
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

@Component({
  selector: 'app-occurrence-grid',
  templateUrl: './occurrence-grid.component.html',
  styleUrls: ['./occurrence-grid.component.css']
})
export class OccurrenceGridComponent implements AfterViewInit, OnInit {


  displayedColumns= ["select", "userSciName", "dateObserved", "locality", "isPublic", "id", "identiplanteScore"];
  importDialogRef: MatDialogRef<ImportDialogComponent>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild("sidenav") public detailPanel: MatSidenav;

  private _occFilters: OccurrenceFilters;

  // Instanciate SelectionModel with multiselection allowed and no row 
  // selected at startup:
  selection = new SelectionModel<Occurrence>(true, []);


    @Input() set occFilters(newOccFilters: OccurrenceFilters) {
        if (  newOccFilters !== null) {

            this.dataSource.loadOccurrences(            
                this.sort.active,
                this.sort.direction,
                this.paginator.pageIndex,
                this.paginator.pageSize, 
                newOccFilters);
        }
    }


  constructor(
    public dataSource:OccurrencesDataSource, 
    private dialog: MatDialog, 
    public snackBar: MatSnackBar,
    private router: Router) { }

  ngOnInit() {
      this.dataSource.loadOccurrences('', '', 0, 10);

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

  refreshGrid() {
    this.dataSource.loadOccurrences(
        this.sort.active,
        this.sort.direction,
        this.paginator.pageIndex,
        this.paginator.pageSize,
        this._occFilters);
  }

  navigateToCreateOccurrenceForm() {
      this.router.navigateByUrl('/occurrence-form');
  }

  navigateToCreateOccurrenceDetail(occ) {
      this.router.navigate(['/occurrence-detail', occ.id]);
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

      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = false;
      dialogConfig.autoFocus = true;
      dialogConfig.hasBackdrop = true;
      this.importDialogRef = this.dialog.open(ImportDialogComponent, dialogConfig);

      this.importDialogRef
          .afterClosed()
          .subscribe( file => {
              this.importSpreadsheet(file);
          });
  }

  bulkPublish() {
      let ids = this.getSelectedIds();
      this.dataSource.bulkReplace(ids, {isPublic: true}).subscribe(
          data => {
              this.snackBar.open(
              'Les observations ont été publiées avec succès.', 
              'Fermer', 
              { duration: 1500 });
              this.refreshGrid();

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
              this.refreshGrid();

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
              this.refreshGrid();

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
    var pwa = window.open(url);
    //@todo use an angular material dialog
    if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
        alert( 'Merci de désactiver votre bloqueur de popups. Il empêche le téléchargement du fichier des étiquettes.');
    }
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
          this.refreshGrid();

      },
      error => this.snackBar.open(
          'Une erreur est survenue. ' + error, 
          'Fermer', 
          { duration: 1500 })
    );
    this.importDialogRef.close(); 
  }

  translateBoolean(bool) {
      return bool ? "oui":"non";
  }

}
