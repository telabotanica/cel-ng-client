import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import {
  MatDialogRef,
  MatDialogConfig,
  MatSnackBar,
  MatDialog } from '@angular/material';

import { environment } from '../../../../environments/environment';
import { Occurrence } from '../../../model/occurrence/occurrence.model';
import { OccurrencesDataSource } from '../../../services/occurrence/occurrences.datasource';
import { EfloreService } from '../../../services/eflore/eflore.service';
import { AlgoliaEfloreParserService } from '../../../services/eflore/algolia-eflore-parser.service';
import { DeviceDetectionService } from '../../../services/commons/device-detection.service';
import { ConfirmDialogComponent } from '../../../components/occurrence/confirm-dialog/confirm-dialog.component';
import { EfloreCard } from '../../../model/eflore/eflore-card.model';
import {BinaryDownloadService} from '../../../services/commons/binary-download.service';

@Component({
  selector: 'occurrence-detail',
  templateUrl: './occurrence-detail.component.html',
  styleUrls: ['./occurrence-detail.component.css']
})
export class OccurrenceDetailComponent implements OnInit, OnChanges {

  id: number;
  occurrence: Occurrence;
  private subscription: Subscription;
  efloreCard: EfloreCard;
  baseTagLibBaseUrl: string = environment.api.tagLibBaseUrl;
  private _identiplanteBaseUrl: string = environment.identiplante.baseUrl;
  private _apiPrefix = environment.api.prefix;
  private _confirmDeletionMsg = 'Supprimer la/les observation(s) ?';
  isDisplayedInDrawer = false;
  isMobile: boolean;
  @Output() closeEvent = new EventEmitter();
  @Output() occurrenceDeletedEvent = new EventEmitter();
  @Input()
  set occToDisplay(occ: Occurrence) {
    this.occurrence = occ;
    this._loadEfloreCardIfNeeded();
    this.id = occ.id;
  }

  @Input()
  set occurrenceId(occId: number) {
       this.id = occId;
       this.initOccurrence(this.id);
  }

  constructor(
    private dataSource: OccurrencesDataSource,
    private route: ActivatedRoute,
    private router: Router,
    private confirmDialog: MatDialog,
    public snackBar: MatSnackBar,
    private deviceDetectionService: DeviceDetectionService,
    public efloreService: EfloreService,
    private parser: AlgoliaEfloreParserService,
    private dldService: BinaryDownloadService) {

      this.deviceDetectionService.detectDevice().subscribe(result => {
        this.isMobile = result.matches;
      });
  }

  initOccurrence(occId: number) {
           this.dataSource.get(occId).subscribe(
              occurrence => {
                this.occurrence = occurrence;
                this._loadEfloreCardIfNeeded();
              }
           );
  }

  ngOnChanges() {

  }

  ngOnInit() {
    if ( this.occurrence == null ) {
        this.isDisplayedInDrawer = false;
        this.subscription = this.route.params.subscribe(params => {
           this.id = parseInt(params['id']);
           this.initOccurrence(this.id);
         }
       );
    } else {
      this.isDisplayedInDrawer = true;
      this._loadEfloreCardIfNeeded();
    }
  }

  private _loadEfloreCardIfNeeded() {
      if (this.occurrence.userSciName != null && this.occurrence.taxoRepo != null && this.occurrence.taxoRepo !== 'Autre/inconnu') {
        this.efloreService.get(this.occurrence.userSciName).subscribe(result => {
              this.efloreCard = this.parser.parseEfloreCard(result, this.occurrence.taxoRepo);
        });
      } else {
        this.efloreCard = null;
      }
  }

  navigateToEditOccurrenceForm(id: number) {
    this.closeEvent.emit();
    this.router.navigate(['/occurrence-collection-edit-form', id]);
  }

  openEfloreCard() {
    window.open(this.efloreCard.permalink , '_blank');
  }

  openIdentiPlante() {
    const url = `${this._identiplanteBaseUrl}/obs${this.occurrence.id}`;
    window.open(url , '_blank');
  }

  publish() {
    const id = this.occurrence.id;
    this.dataSource.patch(id, {isPublic: true}).subscribe(
      data => {
          this.snackBar.open(
          'L’observation a été publiée avec succès.',
          'Fermer',
          { duration: 3500 });
          this.occurrence.isPublic = true;
      },
      error => {
        this.snackBar.open(
          'Une erreur est survenue. ' + error,
          'Fermer',
          { duration: 3500 });
        }
    );
  }
    isPublishable() {
      return (
          ( this.occurrence.certainty != null ) &&
          ( this.occurrence.locality != null || this.occurrence.geometry != null ) &&
          ( this.occurrence.dateObserved !== null) );
    }


  unpublish() {
    const id = this.occurrence.id;
    this.dataSource.patch(id, {isPublic: false}).subscribe(
      data => {
        this.snackBar.open(
          'L’observation a été dépubliée avec succès.',
          'Fermer',
          { duration: 3500 });
        this.occurrence.isPublic = false;
      },
    error => this.snackBar.open(
      'Une erreur est survenue. ' + error,
      'Fermer',
      { duration: 3500 })
    );
  }


  clone() {
    this.closeEvent.emit();
    const id = this.occurrence.id;
    this.dataSource.bulkCopy([id]).subscribe(
      data => {
        // The key in the JSON response for the current resource
        // is its relative URL:
        const key = `/${this._apiPrefix}/occurrences/${this.occurrence.id}`;
        // Retrieve the id of the duplicated occurrence from the JSON response:
        const duplicatedId = data[0][key].message.id;

        this.snackBar.open(
        'L’observation a été dupliquée avec succès.',
        'Fermer',
        { duration: 3500 });

        this.navigateToEditOccurrenceForm(duplicatedId);
      },
      error => this.snackBar.open(
        'Une erreur est survenue. ' + error,
        'Fermer',
        { duration: 3500 })
    );
  }

  buildDialogConfig() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.hasBackdrop = true;
    return dialogConfig;
  }

  openConfirmDeletionDialog() {

    const dialogConfig = this.buildDialogConfig();
    dialogConfig.data = this._confirmDeletionMsg;
    const confirmDialogRef = this.confirmDialog.open(ConfirmDialogComponent, dialogConfig);

    confirmDialogRef
      .afterClosed()
      .subscribe( response => {
          if (response == true) {
            this.delete();
          }
      });
  }

  delete() {
    const id = this.occurrence.id;
    this.dataSource.delete(id).subscribe(
      () => {
        this.snackBar.open(
        'L’observation a été supprimée avec succès.',
        'Fermer',
        { duration: 3500 });
        this.occurrenceDeletedEvent.emit();
      },
      error => this.snackBar.open(
        'Une erreur est survenue. ' + error,
        'Fermer',
        { duration: 3500 })
    );
  }

  generatePdfEtiquette() {
    this.snackBar.open(
      'Génération de l’étiquette en cours, merci de votre patience :)',
      'Fermer',
      { duration: undefined });

    this.dataSource.generatePdfEtiquette([this.occurrence.id]).subscribe(
      data => this.dldService.downloadBinary(data, 'application/pdf', 'cel-etiquette-' + this.occurrence.id + '-'),
      () => this.snackBar.open(
        'Une erreur est survenue durant la génération de l’étiquette.',
        'Fermer',
        { duration: 3500 })
    );
  }

  getPublishButtonTooltip() {
    return this.isPublishable() ? 'Rendre publique l’observation' : 'La publication n’est possible que pour les observations dont la localisation, la date et la certitude d’identification ont été renseignées.';

  }
  close() {
    this.closeEvent.emit();
  }

}
