
import {
  Component,
  OnInit,
  AfterViewInit,
    Injectable,
  Output,
  ViewChild,
  EventEmitter,
  Input } from '@angular/core';

import {
  MatPaginator,
  MatSort,
  MatDialogRef,
  MatTableDataSource,
  MatDialogConfig,
  MatSnackBar,
  MatDialog } from '@angular/material';

import {OccurrenceFilters}
  from '../../../model/occurrence/occurrence-filters.model';
import { Occurrence }
  from '../../../model/occurrence/occurrence.model';
import { OccurrencesDataSource }
  from '../../../services/occurrence/occurrences.datasource';
import { ImportDialogComponent }
  from '../../../components/occurrence/import-dialog/import-dialog.component';
import { SsoService }
  from '../../../services/commons/sso.service';
import { ConfirmDialogComponent }
  from '../../../components/occurrence/confirm-dialog/confirm-dialog.component';
import {
    BinaryDownloadService
} from '../../../services/commons/binary-download.service';
import {
    DeviceDetectionService
} from '../../../services/commons/device-detection.service';
import {
    ProfileService
} from '../../../services/profile/profile.service';
import {
    TokenService
} from '../../../services/commons/token.service';
import {
    NavigationService
} from '../../../services/commons/navigation.service';
import { BaseComponent } from '../../generic/base-component/base.component';

/**
 * Base component responsible for functionalities commonly shared by
 * CEL components i.e.:
 *
 * <ul>
 *  <li>navigation (app routing)</li>
 *  <li>device detection</li>
 *  <li>SSO JWT token access/decoding</li>
 * </ul>
 */
@Injectable()
export abstract class OccurrenceCollectionManagementComponent extends BaseComponent {

  protected _occFilters: OccurrenceFilters;
  // The selected features (GeoJSON encoded occurrences):
  selected: any;
  selectedCount: number;

  protected importDialogRef: MatDialogRef<ImportDialogComponent>;


  protected _confirmDeletionMsg = 'Supprimer la/les observation(s) ?';
  @Output() showFilterEvent = new EventEmitter();
  @ViewChild('drawer') detailDrawer: any;
  @ViewChild('odl') occurrenceDetail: any;

    constructor(

    public  dataSource:             OccurrencesDataSource,
    protected dialog:                 MatDialog,
    protected ssoService:             SsoService,
    protected confirmDialog:          MatDialog,
    protected dldService:             BinaryDownloadService,

    public snackBar:                MatSnackBar,

        protected _tokenService: TokenService,
        protected _navigationService: NavigationService,
        protected _profileService: ProfileService,
        protected _deviceDetectionService: DeviceDetectionService) {


    super(_tokenService,
        _navigationService,
        _profileService,
        _deviceDetectionService) ;
    }

  @Input() set occFilters(newOccFilters: OccurrenceFilters) {
    if (  newOccFilters != null ) {
      this._occFilters = newOccFilters;
      this.refresh();
    }
  }


  private buildDialogConfig() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.hasBackdrop = true;
    return dialogConfig;
  }


  showFilters() {
     this.showFilterEvent.emit();
  }


  export() {
    if ( ! this._occFilters ) {
        this._occFilters = new OccurrenceFilters();
    }
    this._occFilters.ids = this.getSelectedIds();

    this.snackBar.open(
      'Génération de l’export en cours, merci de votre patience :)',
      'Fermer',
      { duration: 3500 });

    this.dataSource.export(this._occFilters).subscribe(
      data => this.dldService.downloadBinary(data, 'text/csv', 'cel-export-'),
      () => this.snackBar.open(
        'Une erreur est survenue durant la génération de l’export.',
        'Fermer',
        { duration: 3500 })
    );
  }

  getSelectedOccurrences() {
    return this.selected.array_.values_map(function(feature) {
      return feature.values_.id;
    });
  }

  openConfirmDeletionDialog(value) {

    const dialogConfig = this.buildDialogConfig();
    dialogConfig.data = this._confirmDeletionMsg;
    const confirmDialogRef = this.confirmDialog.open(ConfirmDialogComponent, dialogConfig);

    confirmDialogRef
      .afterClosed()
      .subscribe( response => {
          if (response == true) {
            this.bulkDelete();
          }
      });
  }

    bulkDelete() {

        const ids = this.getSelectedIds();

        this.dataSource.bulkRemove(ids).subscribe(
            data => {
                this.refresh();
                this.snackBar.open(
                'Les observations ont été supprimées avec succès.',
                'Fermer',
                { duration: 3500 });

            },
            error => this.snackBar.open(
                'Une erreur est survenue. ' + error,
                'Fermer',
                { duration: 3500 })
        );
    }

  bulkEdit() {
      const ids = this.getSelectedIds();
      let strIds = '';
      for (const id of ids) {
          strIds += id;
          strIds += ',';
      }
      // Remove the trailing comma:
      strIds = strIds.substring(0, strIds.length - 1);
      this.navigateToMultiEditOccurrenceForm(strIds);
  }

    getSelectedIds() {
      return this.selected.array_.map(function(feature) {
        return feature.values_.id;
      });
    }


    openImportDialog() {

        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = true;
        dialogConfig.hasBackdrop = true;
        this.importDialogRef = this.dialog.open(ImportDialogComponent, dialogConfig);

        this.importDialogRef
            .afterClosed()
            .subscribe( file => {
                this.importSpreadsheet(file);
            });
    }

  bulkPublish() {
      const occz = this.getSelectedOccurrences();
      const privateOccz = occz.filter(occ => (occ.isPublic == false) );
      const privateOccIdz = privateOccz.map(function(occurrence) {
        return occurrence.id;
      });

      if ( privateOccIdz.length > 0 ) {
          this.dataSource.bulkReplace(privateOccIdz, {isPublic: true}).subscribe(
              data => {
                  let nbOfPublishedOccz = 0;
                  for (const d of data)  {
                    if ( d[Object.keys(d)[0]].message.isPublic == true ) {
                      nbOfPublishedOccz++;
                    }
                  }
                  let msg;
                  if ( nbOfPublishedOccz > 0 ) {
                    msg = 'Les observations complètes ont été publiées avec succès';
                  } else {
                    msg = 'Observation(s) incomplète(s) : aucune observation publiée. Consulter l’aide pour plus d’informations sur les conditions de publication.';
                  }
                  this.snackBar.open(
                  msg,
                  'Fermer',
                  { duration: 3500 });
                  this.refresh();

              },
              error => this.snackBar.open(
                  'Une erreur est survenue. ' + error,
                  'Fermer',
                  { duration: 3500 })
          );
    } else {
        this.snackBar.open(
          'Aucune observation privée. Aucune observation à publier.',
          'Fermer',
          { duration: 3500 });
    }
  }

    bulkUnpublish() {
        const ids = this.getSelectedIds();
        this.dataSource.bulkReplace(ids, {isPublic: false}).subscribe(
            data => {
                this.snackBar.open(
                'Les observations ont été dépubliées avec succès.',
                'Fermer',
                { duration: 3500 });

            },
            error => this.snackBar.open(
                'Une erreur est survenue. ' + error,
                'Fermer',
                { duration: 3500 })
        );
    }

    importSpreadsheet(file: File) {
        const snackBarRef = this.snackBar.open('Import en cours. Cela peut prendre un certain temps.', 'Fermer', {
            duration: 3500
        });

        this.dataSource.importSpreadsheet(file).subscribe(
            data => {
                this.refresh();
                this.snackBar.open(
                'Les observations ont été importées avec succès.',
                'Fermer',
                { duration: 3500 });

            },
            error => this.snackBar.open(
                'Une erreur est survenue. ' + error,
                'Fermer',
                { duration: 3500 })
        );
        this.importDialogRef.close();
    }

abstract refresh();

  abstract getSelectedCount();

}
