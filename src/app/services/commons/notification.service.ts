import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  static readonly duration: number   = 3500;
  static readonly closeLabel: string = 'Fermer';

  constructor(public snackBar: MatSnackBar) {
  }

  notify(message: string, duration = NotificationService.duration): void {
    this.snackBar.open(
      message,
      NotificationService.closeLabel,
      { duration: duration }
    );
  }

  notifyError(message: string, duration = NotificationService.duration): void {
    this.snackBar.open(
      message,
      NotificationService.closeLabel,
      { duration: duration }
    );
  }

}
