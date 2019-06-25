import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { 
  MatDialogRef, 
  MatDialogConfig, 
  MatSnackBar,
  MatDialog } from "@angular/material";
import { DeviceDetectionService } from "../../../services/commons/device-detection.service";
import { OccurrenceDetailDialogComponent } 
  from "../../../components/occurrence/occurrence-detail-dialog/occurrence-detail-dialog.component";


@Component({
  selector: 'occurrence-list-detail',
  templateUrl: './occurrence-list-detail.component.html',
  styleUrls: ['./occurrence-list-detail.component.css']
})
export class OccurrenceListDetailComponent implements OnInit {

  occurrences = [];
  isMobile: boolean;
  @Output() closeEvent = new EventEmitter();
  @Input() 
  set featuresToDisplay(features) {
    this.updateFeatures(features);

  }

  constructor(
    public dialog: MatDialog,
    private deviceDetectionService: DeviceDetectionService) {
      this.deviceDetectionService.detectDevice().subscribe(result => {
        this.isMobile = result.matches;
      });
  }

  updateFeatures(features) {

console.log("----------------------------------");
    let occz = []
    // the features object returned by OL is not iterable as is using *ngFor
    // so we need to create an array of let'say, dummy js obj out of it:
    // @refactor use Occurrence model instead of POjsO?
    features.forEach(function (feature) {
      let dateObsObj = feature.get('dateObserved')
      let dateObs =  ( dateObsObj != null ) ? dateObsObj.date : null; 
      occz.push({
       'id':feature.get('id'),
       'userSciName':feature.get('userSciName'),
       'dateObserved':dateObs,
       'locality':feature.get('locality')});
    });
    this.occurrences = occz;

  }

  ngOnInit() {
  
  }

  openDetail(occId: number) {
    const dialogRef = this.dialog.open(OccurrenceDetailDialogComponent, {
      width: '700px',
      height: '900px',
      data: {occurrenceId: occId}
    });
  }


  close() {
    this.closeEvent.emit();
  }

}