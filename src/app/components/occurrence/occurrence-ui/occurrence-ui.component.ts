import { Component, OnInit } from '@angular/core';

import { OccurrenceFiltersComponent } from '../occurrence-filters/occurrence-filters.component';
import { OccurrenceDetailComponent } from '../occurrence-detail/occurrence-detail.component';
import { OccurrenceFilters } from "../../../model/occurrence/occurrence-filters.model";

@Component({
  selector: 'app-occurrence-ui',
  templateUrl: './occurrence-ui.component.html',
  styleUrls: ['./occurrence-ui.component.css']
})
export class OccurrenceUiComponent implements OnInit {

  occFilters: OccurrenceFilters;

  constructor() { }

  ngOnInit() {
        
  }

  applyFilters(occFilters: OccurrenceFilters) { 
      this.occFilters = occFilters;

  }

}
