import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import {PhotoFilters} from "../../../model/photo/photo-filters.model";
import { TelaBotanicaProject } from "../../../model/occurrence/tela-botanica-project.model";
import { TelaBotanicaProjectService } from "../../../services/occurrence/tela-botanica-project.service";

@Component({
  selector: 'app-photo-filters',
  templateUrl: './photo-filters.component.html',
  styleUrls: ['./photo-filters.component.css']
})
export class PhotoFiltersComponent implements OnInit {


  photoSearchFormGroup;
  public telaBotanicaProjects: TelaBotanicaProject[];
  private selectedProjectId;
  private selectedIsPublic;
  private selectedIsIdentiplanteValidated;
  private selectedCertainty;

  isPublic;       
  certainty;         
  isIdentiplanteValidated;
  projectId;
  project;

  @Output() applyFiltersEvent = new EventEmitter();
  
    
  constructor(private tbPrjService: TelaBotanicaProjectService) { }

  ngOnInit() {

    this.photoSearchFormGroup = new FormGroup({
       isPublic:          new FormControl(),
       dateShotDay:       new FormControl(),
       dateShotMonth:     new FormControl(),
       dateShotYear:      new FormControl(),
       osmCountry:        new FormControl(),
       osmLocality:       new FormControl(),
       frenchDep:         new FormControl(),
       certainty:         new FormControl(),
       project:           new FormControl(),
       tag:               new FormControl(),
       freeTextQuery:     new FormControl(),
    });

    this.tbPrjService.getCollection().subscribe(
      tbProjects => this.telaBotanicaProjects = tbProjects
    );

  }

  emitApplyFilterEvent() {

      let photoFilters = new PhotoFilters();

      photoFilters.isPublic = this.selectedIsPublic;
      photoFilters.dateShotDay = this.photoSearchFormGroup.get('dateShotDay').value;
      photoFilters.dateShotMonth = this.photoSearchFormGroup.get('dateShotMonth').value;
      photoFilters.dateShotYear = this.photoSearchFormGroup.get('dateShotYear').value;
      photoFilters.osmCountry = this.photoSearchFormGroup.get('osmCountry').value;
      photoFilters.osmLocality = this.photoSearchFormGroup.get('osmLocality').value;
      photoFilters.frenchDep = this.photoSearchFormGroup.get('frenchDep').value;
      photoFilters.certainty = this.selectedCertainty;
      photoFilters.projectId = this.selectedProjectId;
      photoFilters.isIdentiplanteValidated = this.selectedIsIdentiplanteValidated;

      //photoFilters.tags = [this.photoSearchFormGroup.get('tag').value];
      photoFilters.freeTextQuery = this.photoSearchFormGroup.get('freeTextQuery').value;

      this.applyFiltersEvent.emit(photoFilters);

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
