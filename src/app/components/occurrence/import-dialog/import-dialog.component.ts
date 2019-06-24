import { Component, OnInit, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MatSnackBar } from "@angular/material";
import {
    DOCUMENT
} from '@angular/common';

import {
    environment
} from '../../../../environments/environment';

@Component({
  selector: 'app-import-dialog',
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.css']
})
export class ImportDialogComponent implements OnInit {

  importFormGroup;
  spreadsheetFile;
  private static readonly _importTemplateUrl: string = environment.app.importTemplateUrl;
  onImport = new EventEmitter();

  constructor(
    public snackBar: MatSnackBar, 
    private importDialogRef: MatDialogRef<ImportDialogComponent>,
    @Inject(DOCUMENT) private document: any) { }

  ngOnInit() {

    this.importFormGroup = new FormGroup({
       importFile: new FormControl()
    });

  }

    

    onImportButtonClick() {
      this.onImport.emit();
    }

    save() {
        this.importDialogRef.close();
    }

    // @todo impl  delegate to the parent
    import(files) {
        this.spreadsheetFile = files.item(0);
        this.importDialogRef.close(files.item(0));
    }

    navigateToImportTemplate() {
        this.document.location.href = ImportDialogComponent._importTemplateUrl;
    }

}
