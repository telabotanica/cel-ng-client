import { Injectable } from '@angular/core';
import { MatSnackBar } from "@angular/material";

@Injectable({
  providedIn: 'root'
})
export class BinaryDownloadService {

  downloadBinary(srcWindow, data, mimeType): void {
            var blob = new Blob([data], { type: mimeType});
            var url = window.URL.createObjectURL(blob);
            //this.router.navigate([url]);
            //Populating the file
            srcWindow.location.href = url;
/*
        var pwa = window.open(url, '_blank');

        //@todo use an angular material dialog
        if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
            alert('Merci de désactiver votre bloqueur de popups. Il empêche le téléchargement du fichier d\'export.');
        }
*/

  }


}
