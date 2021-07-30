import { Injectable } from '@angular/core';
import {NotificationService} from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class BinaryDownloadService {

  constructor(
    private _notifService: NotificationService,
  ) {}


  downloadBinary(data, mimeType, filename, autoSuffix = true): void {
    if (autoSuffix) {
      filename = filename + (new Date()).toISOString().slice(0, 19).replace(/-|:|T/g, '');
    }
    const blob = new Blob([data], { type: mimeType});
    const link = window.document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    // Set downloaded filename to link.download
    link.download = filename + '.' + mimeType.split('/').pop();
    document.body.appendChild(link);
    link.click();
    this._notifService.notify('Téléchargement en cours', 1500);
    document.body.removeChild(link);
  }
}
