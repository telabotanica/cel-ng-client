import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import {PhotoFilters} from "../../../model/photo/photo-filters.model";
import { TelaBotanicaProject } from "../../../model/occurrence/tela-botanica-project.model";
import { TelaBotanicaProjectService } from "../../../services/occurrence/tela-botanica-project.service";
import { DeviceDetectionService } from "../../../services/commons/device-detection.service";

@Component({
  selector: 'app-photo-filters',
  templateUrl: './photo-filters.component.html',
  styleUrls: ['./photo-filters.component.css']
})
export class PhotoFiltersComponent implements OnInit {

  @ViewChild('tagTree') tagTree;
  public telaBotanicaProjects: TelaBotanicaProject[];
  private selectedProjectId;
  private selectedIsPublic;
  private selectedIsIdentiplanteValidated;
  private selectedCertainty;
  formGroup: FormGroup;
  isMobile: boolean = false;
  isPublic;       
  certainty;         
  isIdentiplanteValidated;
  projectId;
  project;

  @Output() applyFiltersEvent = new EventEmitter();
  @Output() closeFiltersEvent = new EventEmitter();  
    
  constructor(private _tbPrjService: TelaBotanicaProjectService,
              private _deviceDetectionService:     DeviceDetectionService) { }

  ngOnInit() {

    this.formGroup = new FormGroup({
       dateShotDay:             new FormControl(),
       dateShotMonth:           new FormControl(),
       dateShotYear:            new FormControl(),
       osmCountry:              new FormControl(),
       locality:                new FormControl(),
       frenchDep:               new FormControl(),
       certainty:               new FormControl(),
       tag:                     new FormControl(),
       freeTextQuery:           new FormControl(),
       projectId:               new FormControl(),
       isPublic:                new FormControl(),
       isIdentiplanteValidated: new FormControl(),
    });

    this._tbPrjService.getCollection().subscribe(
      tbProjects => this.telaBotanicaProjects = tbProjects
    );
    this._initResponsive();

  }

  emitApplyFilterEvent() {

      let photoFilters = new PhotoFilters();

      photoFilters.isPublic = this.selectedIsPublic;
      photoFilters.dateShotDay = this.formGroup.get('dateShotDay').value;
      photoFilters.dateShotMonth = this.formGroup.get('dateShotMonth').value;
      photoFilters.dateShotYear = this.formGroup.get('dateShotYear').value;
      photoFilters.osmCountry = this.formGroup.get('osmCountry').value;
      photoFilters.locality = this.formGroup.get('locality').value;
      photoFilters.frenchDep = this.formGroup.get('frenchDep').value;
      photoFilters.certainty = this.selectedCertainty;
      photoFilters.projectId = this.selectedProjectId;
      photoFilters.isIdentiplanteValidated = this.selectedIsIdentiplanteValidated;
      photoFilters.tags = this.tagTree.photoTagSelection.selected.map(sel => sel.item);
      photoFilters.freeTextQuery = this.formGroup.get('freeTextQuery').value;

      this.applyFiltersEvent.emit(photoFilters);

  }
 
  resetFilters() {
    this.formGroup.reset();
    this.tagTree.reset();
    this.emitApplyFilterEvent();
  }

  private _initResponsive() {
    
    // @responsive: sets isMobile member value
    this._deviceDetectionService.detectDevice().subscribe(result => {
      this.isMobile = result.matches;
    });
  }


  closeMobile() {
    this.closeFiltersEvent.emit();
  }

    changeProjectId(event) {
       this.selectedProjectId = event.value;
    } 

  changeIsPublic(event) {
     this.selectedIsPublic = event.value;
  }

  changeCertainty(event) {
     this.selectedCertainty = event.value;
  }

  changeIsIdentiplanteValidated(event) {
     this.selectedIsIdentiplanteValidated = event.value;
  }

}
