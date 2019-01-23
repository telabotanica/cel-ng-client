import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'app-user-profile-ui',
  templateUrl: './user-profile-ui.component.html',
  styleUrls: ['./user-profile-ui.component.css']
})
export class UserProfileUiComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  navigateToHelp() {
    this.router.navigate(['/help']);
  }

}
