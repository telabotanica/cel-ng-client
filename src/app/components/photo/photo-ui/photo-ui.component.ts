import { Component, OnInit } from '@angular/core';

import { PhotoFiltersComponent } from '../photo-filters/photo-filters.component';
import { PhotoDetailComponent } from '../photo-detail/photo-detail.component';
import { PhotoFilters } from '../../../model/photo/photo-filters.model';
import { DeviceDetectionService } from '../../../services/commons/device-detection.service';

@Component({
  selector: 'app-photo-ui',
  templateUrl: './photo-ui.component.html',
  styleUrls: ['./photo-ui.component.css']
})
export class PhotoUiComponent implements OnInit {

  filters: PhotoFilters;
  isMobile = false;
  isFilterVisible = false;

  constructor(private deviceDetectionService: DeviceDetectionService) {

    deviceDetectionService.detectDevice().subscribe(result => {
      this.isMobile = result.matches;
    });

  }

  ngOnInit() {

  }

  onShowFilterEvent() {
        this.isFilterVisible = true;
  }

  onCloseFilterEvent() {
     this.isFilterVisible = false;
  }

  applyFilters(filters) {
      this.filters = filters;
  }

}
