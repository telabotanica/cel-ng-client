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
  Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  // Links for the main, centered, menu:	
  mainMenuLinks = [
    { path: 'occurrence-ui', label: 'OBSERVATIONS' },
    { path: 'photo-ui', label: 'PHOTOS' },
    { path: 'map-ui', label: 'CARTE' },
  ];
  activeLink = this.mainMenuLinks[0];



  constructor(private router: Router) { }

  ngOnInit() {
  }

  navigateToUserProfile() {
      this.router.navigateByUrl('/user-profile-ui');
  }

}
