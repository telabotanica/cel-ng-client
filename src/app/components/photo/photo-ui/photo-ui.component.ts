import { Component, OnInit } from '@angular/core';

import { PhotoFiltersComponent } from '../photo-filters/photo-filters.component';
import { PhotoDetailComponent } from '../photo-detail/photo-detail.component';
import {PhotoFilters} from "../../../model/photo/photo-filters.model";
 
@Component({
  selector: 'app-photo-ui',
  templateUrl: './photo-ui.component.html',
  styleUrls: ['./photo-ui.component.css']
})
export class PhotoUiComponent implements OnInit {

  filters: PhotoFilters;

  constructor() { }

  ngOnInit() {
  }

  applyFilters(filters) { 
      this.filters = filters;
  }

}
