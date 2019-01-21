import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import { 
  AfterViewInit, 
  Component, 
  EventEmitter,
  Inject,
  ElementRef, 
  OnInit, 
  ViewChild, 
  Output } from '@angular/core';
import { 
  Router, ActivatedRoute } from "@angular/router";
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

import { OccurrencesDataSource } from "../../../services/occurrence/occurrences.datasource";
import { OccurrenceFilters }  from "../../../model/occurrence/occurrence-filters.model";
import { Occurrence } from "../../../model/occurrence/occurrence.model";


@Component({
  selector: 'app-photo-link-occurrence-dialog',
  templateUrl: './photo-link-occurrence-dialog.component.html',
  styleUrls: ['./photo-link-occurrence-dialog.component.css']
})
export class PhotoLinkOccurrenceDialogComponent implements OnInit {

  displayedColumns= ["select", "userSciName", "dateObserved", "locality"];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Output() occurrenceChosen: EventEmitter<Occurrence> = new EventEmitter();

  // Instanciate SelectionModel with single selection allowed and no row 
  // selected at startup:
  selection = new SelectionModel<Occurrence>(false, []);



  constructor(
    public dialogRef: MatDialogRef<PhotoLinkOccurrenceDialogComponent>,
    public dataSource:OccurrencesDataSource, 
    public snackBar: MatSnackBar,
    private router: Router) { }

    ngOnInit() {
        this.dataSource.loadOccurrences('', '', 0, 10);
    }

    ngAfterViewInit() {

        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

        merge(this.sort.sortChange, this.paginator.page)
        .pipe(
            tap(() => {
                console.log(this.paginator);
                this.refreshGrid();
                   // alert(this.sort.active);
            })
        )
        .subscribe();

    }

    selectOccurrence(occurrence) {
        this.dialogRef.close(occurrence);
    }

    refreshGrid() {

        this.dataSource.loadOccurrences(
            this.sort.active,
            this.sort.direction,
            this.paginator.pageIndex,
            this.paginator.pageSize);
    }

    chooseOccurrence(occurrence) {

    }


}
