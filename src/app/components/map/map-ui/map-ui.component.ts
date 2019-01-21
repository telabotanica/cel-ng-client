import { Component, OnInit } from '@angular/core';
import { OccurrenceFilters } from "../../../model/occurrence/occurrence-filters.model";

@Component({
  selector: 'app-map-ui',
  templateUrl: './map-ui.component.html',
  styleUrls: ['./map-ui.component.css']
})
export class MapUiComponent implements OnInit {

  occFilters: OccurrenceFilters;

  constructor() { }

  ngOnInit() {
  }

  applyFilters(occFilters) { 
      this.occFilters = occFilters;
  }

}
