import { Component, OnInit } from '@angular/core';
import {
    Router
} from '@angular/router';

import { OccurrenceFiltersComponent } from '../occurrence-filters/occurrence-filters.component';
import { OccurrenceDetailComponent } from '../occurrence-detail/occurrence-detail.component';
import { OccurrenceFilters } from '../../../model/occurrence/occurrence-filters.model';
import { DeviceDetectionService } from '../../../services/commons/device-detection.service';
import { ProfileService } from '../../../services/profile/profile.service';
import { TokenService } from '../../../services/commons/token.service';
import { BaseComponent } from '../../generic/base-component/base.component';

@Component({
  selector: 'app-occurrence-ui',
  templateUrl: './occurrence-ui.component.html',
  styleUrls: ['./occurrence-ui.component.css']
})
export class OccurrenceUiComponent extends BaseComponent {

  occFilters: OccurrenceFilters;
  isMobile = false;
  isFilterVisible = false;


  onShowFilterEvent() {
     this.isFilterVisible = true;
  }

  onCloseFilterEvent() {
     this.isFilterVisible = false;
  }

  applyFilters(occFilters: OccurrenceFilters) {
      this.occFilters = occFilters;
  }

}
