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
  Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import {
  MatPaginator,
  MatSort,
  MatTableDataSource,
  MatSnackBar} from '@angular/material';
import {
  debounceTime,
  distinctUntilChanged,
  startWith,
  tap,
  delay } from 'rxjs/operators';

import { PhotoService } from '../../../services/photo/photo.service';
import { Photo } from '../../../model/photo/photo.model';
import { environment } from '../../../../environments/environment';

@Component({
  templateUrl: './tag-dialog.component.html',
  styleUrls: ['./tag-dialog.component.css']
})
export class TagDialogComponent {

  // Configuration values for Stephane's modules:
  tagObjectId: number = null;
  baseCelApiUrl: string = environment.api.baseUrl;
  tagLibBaseUrl: string = environment.api.tagLibBaseUrl;
  apiPrefix: string = environment.api.prefix;
  apiPath = `/{{apiPrefix}}/user_occurrence_tags`;
  apiRelationPath = `/{{apiPrefix}}/occurrence_user_occurrence_tag_relations`;
  apiRetrievePath = `/{{apiPrefix}}/occurrence/{id}/occurrence_user_occurrence_tag_relations`;
  objectName = 'occurrence';
  objectEndpoint = `/{{apiPrefix}}/occurrences`;
  tagName = 'userOccurrenceTag';
  tagEndpoint = `/{{apiPrefix}}/user_occurrence_tags`;
  delayTagApiCalls: Boolean;
  tagsToBeAdded;

  constructor(
    private dialogRef: MatDialogRef<TagDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.tagObjectId = data.objectId;
    this.delayTagApiCalls = data.delayTagApiCalls;
  }


  onTagRemoved(tag: any) {
    console.debug(tag);
  }

  onPostTagError(error: any) {
    console.debug(error);
  }


  onTagAdded(tag: any) {
    console.debug(tag);
  }



}

