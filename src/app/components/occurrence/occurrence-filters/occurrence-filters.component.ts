import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { OccurrenceFilters } from "../../../model/occurrence/occurrence-filters.model";
import { TelaBotanicaProject } from "../../../model/occurrence/tela-botanica-project.model";
import { TelaBotanicaProjectService } from "../../../services/occurrence/tela-botanica-project.service";
import { DeviceDetectionService } from "../../../services/commons/device-detection.service";

@Component({
  selector: 'app-occurrence-filters',
  templateUrl: './occurrence-filters.component.html',
  styleUrls: ['./occurrence-filters.component.css']
})
export class OccurrenceFiltersComponent implements OnInit {

  @ViewChild('tagTree') tagTree;
  formGroup: FormGroup;
  isIdentiplanteValidated;
  projectId;
  project;
	isPublic;
	certainty;         
  telaBotanicaProjects: TelaBotanicaProject[];
  selectedProjectId;
  isMobile: boolean = false;
  private selectedIsPublic;
  private selectedIsIdentiplanteValidated;
  private selectedCertainty;

  @Output() applyFiltersEvent = new EventEmitter<OccurrenceFilters>();
  @Output() closeFiltersEvent = new EventEmitter();

  constructor(private _tbPrjService: TelaBotanicaProjectService,
              private _deviceDetectionService:     DeviceDetectionService) { }

  ngOnInit() {
    this._initFormGroup();
    this._initResponsive();
    this._tbPrjService.getCollection().subscribe(
      tbProjects => this.telaBotanicaProjects = tbProjects
    );
  }

  private _initFormGroup() {
    this.formGroup = new FormGroup({
       dateObservedDay:   new FormControl(),
       dateObservedMonth: new FormControl(),
       dateObservedYear:  new FormControl(),
       osmCountry:        new FormControl(),
       locality:          new FormControl(),
       frenchDep:         new FormControl(),
       certainty:         new FormControl(),
       project:           new FormControl(),
       //userOccurrenceTags: new FormControl(),
       freeTextQuery:      new FormControl(),
       isPublic:                new FormControl(),
       isIdentiplanteValidated: new FormControl(),
    });


  }

  closeMobile() {
    this.closeFiltersEvent.emit();
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

  emitApplyFilterEvent() {

    let occFilters = new OccurrenceFilters();

    occFilters.isPublic = this.selectedIsPublic;
    occFilters.dateObservedDay = this.formGroup.get('dateObservedDay').value;
    occFilters.dateObservedMonth = this.formGroup.get('dateObservedMonth').value;
    occFilters.dateObservedYear = this.formGroup.get('dateObservedYear').value;
    occFilters.osmCountry = this.formGroup.get('osmCountry').value;
    occFilters.locality = this.formGroup.get('locality').value;
    occFilters.frenchDep = this.formGroup.get('frenchDep').value;
    occFilters.certainty = this.selectedCertainty;
    occFilters.projectId = this.selectedProjectId;
    occFilters.isIdentiplanteValidated = this.selectedIsIdentiplanteValidated;
    occFilters.tags = this.tagTree.userOccurrenceTagSelection.selected.map(sel => sel.item);
  console.debug(occFilters.tags);

    occFilters.freeTextQuery = this.formGroup.get('freeTextQuery').value;
    this.applyFiltersEvent.emit(occFilters);

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
