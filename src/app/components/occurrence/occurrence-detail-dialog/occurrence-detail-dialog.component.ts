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
import { Subscription } from 'rxjs/Subscription';
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

export interface OccurrenceDetailDialogData {
  occurrenceId: number
}

@Component({
  templateUrl: './occurrence-detail-dialog.component.html',
  styleUrls: ['./occurrence-detail-dialog.component.css']
})
export class OccurrenceDetailDialogComponent {

  occurrenceId: number;

  constructor(
    public dialogRef: MatDialogRef<OccurrenceDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OccurrenceDetailDialogData) {  

    this.occurrenceId = data.occurrenceId;
  }

  onOccurrenceDeleted() {
    this.dialogRef.close({ deleted: this.occurrenceId });
  }

  close() {
    this.dialogRef.close();
  }

}
