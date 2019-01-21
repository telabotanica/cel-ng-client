import { Component, OnInit,EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MatSnackBar } from "@angular/material";

@Component({
  selector: 'app-import-dialog',
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.css']
})
export class ImportDialogComponent implements OnInit {

  importFormGroup;
  spreadsheetFile;
  onImport = new EventEmitter();

  constructor(public snackBar: MatSnackBar, private importDialogRef: MatDialogRef<ImportDialogComponent>) { }

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


}
