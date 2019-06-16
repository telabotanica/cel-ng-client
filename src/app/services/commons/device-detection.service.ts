import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DeviceDetectionService {

  public isMobile: boolean = false;

  constructor(private breakpointObserver: BreakpointObserver) { 
  }

  detectDevice() {
    return this.breakpointObserver.observe([
      '(max-width: 599px)'
    ]);
  }

}
