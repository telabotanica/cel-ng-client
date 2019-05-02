import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import {OccurrenceFilters} from "../../../model/occurrence/occurrence-filters.model";
import { TelaBotanicaProject } from "../../../model/occurrence/tela-botanica-project.model";
import { TelaBotanicaProjectService } from "../../../services/occurrence/tela-botanica-project.service";

@Component({
  selector: 'app-occurrence-filters',
  templateUrl: './occurrence-filters.component.html',
  styleUrls: ['./occurrence-filters.component.css']
})
export class OccurrenceFiltersComponent implements OnInit {

  occurrenceSearchFormGroup: FormGroup;
  isIdentiplanteValidated;
  projectId;
  project;
  telaBotanicaProjects: TelaBotanicaProject[];
  private selectedProjectId;
  private selectedIsPublic;
  private selectedIsIdentiplanteValidated;
  private selectedCertainty;

  @Output() applyFiltersEvent = new EventEmitter();

        isPublic;
      
       certainty;         
  
    
    
  constructor(private tbPrjService: TelaBotanicaProjectService) { }

  ngOnInit() {

    this.initFormGroup();

    this.tbPrjService.getCollection().subscribe(
      tbProjects => this.telaBotanicaProjects = tbProjects
    );
    //this.onChanges();
  }

  initFormGroup() {
    this.occurrenceSearchFormGroup = new FormGroup({
       isPublic:          new FormControl(),
       dateObservedDay:   new FormControl(),
       dateObservedMonth: new FormControl(),
       dateObservedYear:  new FormControl(),
       osmCountry:        new FormControl(),
       osmLocality:       new FormControl(),
       frenchDep:         new FormControl(),
       certainty:         new FormControl(),
       project:           new FormControl(),
       tag:               new FormControl(),
       freeTextQuery:     new FormControl(),
    });


  }

  emitApplyFilterEvent() {

      let occFilters = new OccurrenceFilters();

      occFilters.isPublic = this.selectedIsPublic;
      occFilters.dateObservedDay = this.occurrenceSearchFormGroup.get('dateObservedDay').value;
      occFilters.dateObservedMonth = this.occurrenceSearchFormGroup.get('dateObservedMonth').value;
      occFilters.dateObservedYear = this.occurrenceSearchFormGroup.get('dateObservedYear').value;
      occFilters.osmCountry = this.occurrenceSearchFormGroup.get('osmCountry').value;
      occFilters.osmLocality = this.occurrenceSearchFormGroup.get('osmLocality').value;
      occFilters.frenchDep = this.occurrenceSearchFormGroup.get('frenchDep').value;
      occFilters.certainty = this.selectedCertainty;
      occFilters.projectId = this.selectedProjectId;
      occFilters.isIdentiplanteValidated = this.selectedIsIdentiplanteValidated;

      //occFilters.tags = [this.occurrenceSearchFormGroup.get('tag').value];
      occFilters.freeTextQuery = this.occurrenceSearchFormGroup.get('freeTextQuery').value;

      this.applyFiltersEvent.emit(occFilters);

  }

    changeProjectId(prjId) {
       this.selectedProjectId = prjId;
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
