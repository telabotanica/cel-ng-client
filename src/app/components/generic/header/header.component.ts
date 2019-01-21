import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import {Overlay, CdkOverlayOrigin, OverlayConfig, OverlayRef} from '@angular/cdk/overlay';
import {
  ComponentPortal,
  // This import is only used to define a generic type. The current TypeScript version incorrectly
  // considers such imports as unused (https://github.com/Microsoft/TypeScript/issues/14953)
  // tslint:disable-next-line:no-unused-variable
  Portal,
  TemplatePortalDirective
} from '@angular/cdk/portal';

import { BurgerMenuComponent } from '../burger-menu/burger-menu.component';

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

  // Links for the right side menu:
  burgerMenuLinks = [
    { path: 'user-profile-ui', label: 'Préférences' },
  ];

  @ViewChild(CdkOverlayOrigin) _overlayOrigin: CdkOverlayOrigin;

  constructor(public overlay: Overlay, public viewContainerRef: ViewContainerRef) { }

  ngOnInit() {
  }

  openUserMenuOverlay() {

    let strategy = this.overlay.position()
        .connectedTo(
            this._overlayOrigin.elementRef,
            {originX: 'end', originY: 'bottom'},
            {overlayX: 'end', overlayY: 'top'} );

    let config = new OverlayConfig({
      positionStrategy: strategy,

    });
    let overlayRef = this.overlay.create(config);

    overlayRef.attach(new ComponentPortal(BurgerMenuComponent));
  }

}
