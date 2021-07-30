import { Component, OnInit } from '@angular/core';
import { OccurrenceFilters } from '../../../model/occurrence/occurrence-filters.model';
import { OccurrenceDetailComponent } from '../../occurrence/occurrence-detail/occurrence-detail.component';
import { DeviceDetectionService } from '../../../services/commons/device-detection.service';

@Component({
  selector: 'app-map-ui',
  templateUrl: './map-ui.component.html',
  styleUrls: ['./map-ui.component.css']
})
export class MapUiComponent implements OnInit {

  occFilters: OccurrenceFilters;
  public isMobile = false;
  public isFilterVisible = false;

  constructor(private deviceDetectionService: DeviceDetectionService) {

    deviceDetectionService.detectDevice().subscribe(result => {
      this.isMobile = result.matches;
    });

  }

  onShowFilterEvent() {
        this.isFilterVisible = true;
  }

  onCloseFilterEvent() {
     this.isFilterVisible = false;
  }

  ngOnInit() {

  }

  applyFilters(occFilters) {
      this.occFilters = occFilters;
  }

}
