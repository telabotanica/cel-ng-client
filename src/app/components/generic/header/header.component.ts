import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import {
  Router, ActivatedRoute
} from '@angular/router';

import { DeviceDetectionService
} from '../../../services/commons/device-detection.service';

@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  // Links for the main, top, menu:
  mainMenuLinks = [
    { path: 'occurrence-ui', label: 'OBSERVATIONS' },
    { path: 'photo-ui', label: 'PHOTOS' },
    { path: 'map-ui', label: 'CARTE' },
  ];
  activeLink = this.mainMenuLinks[0];
  isMobile = false;

  constructor(
    private deviceDetectionService: DeviceDetectionService,
    private router:       Router) {

    deviceDetectionService.detectDevice().subscribe(result => {
      this.isMobile = result.matches;
    });

  }

  ngOnInit() {
  }

  navigateToUserProfile() {
      this.router.navigateByUrl('/user-profile-ui');
  }

  navigateToAppRoot() {
      this.router.navigateByUrl('/occurrence-ui');
  }

}
