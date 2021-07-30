import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DeviceDetectionService {

  public isMobile = false;

  constructor(private breakpointObserver: BreakpointObserver) {
  }

    // @refactor rename to detectMobile now we've got three formats to handle...
  detectDevice() {
    return this.breakpointObserver.observe([
      '(max-width: 1019px)'
    ]);
  }

  detectTablet() {
    return this.breakpointObserver.observe([
      '(max-width: 1300px)'
    ]);
  }

}
