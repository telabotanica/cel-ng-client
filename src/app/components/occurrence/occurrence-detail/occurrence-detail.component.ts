import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';
import { 
  MatDialogRef, 
  MatDialogConfig, 
  MatSnackBar,
  MatDialog } from "@angular/material";

import { environment } from '../../../../environments/environment';
import { Occurrence } from "../../../model/occurrence/occurrence.model";
import { OccurrencesDataSource } from "../../../services/occurrence/occurrences.datasource";
import { EfloreService } from "../../../services/eflore/eflore.service";
import { AlgoliaEfloreParserService } from "../../../services/eflore/algolia-eflore-parser.service";
import { DeviceDetectionService } from "../../../services/commons/device-detection.service";
import { ConfirmDialogComponent } from "../../../components/occurrence/confirm-dialog/confirm-dialog.component";
import { EfloreCard } from "../../../model/eflore/eflore-card.model";

@Component({
  selector: 'occurrence-detail',
  templateUrl: './occurrence-detail.component.html',
  styleUrls: ['./occurrence-detail.component.css']
})
export class OccurrenceDetailComponent implements OnInit {

  id: number;
  occurrence: Occurrence;
  private subscription: Subscription;
  efloreCard: EfloreCard;
  baseTagLibBaseUrl: string = environment.api.tagLibBaseUrl;
  private _identiplanteBaseUrl: string = environment.identiplante.baseUrl;
  private _apiPrefix = environment.api.prefix;
  private _confirmDeletionMsg: string = 'Supprimer la/les observation(s) ?';
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
    private parser: AlgoliaEfloreParserService) {

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

  ngOnInit() {
    if ( this.occurrence == null ) {
        this.isDisplayedInDrawer = false;
        this.subscription = this.route.params.subscribe(params => {
           this.id = parseInt(params['id']);
           this.initOccurrence(this.id);
         }
       );
    }
    else {
      this.isDisplayedInDrawer = true;
      this._loadEfloreCardIfNeeded();
    }
  }

  private _loadEfloreCardIfNeeded() {
      if (this.occurrence.userSciName != null && this.occurrence.taxoRepo !=null && this.occurrence.taxoRepo != 'Autre/inconnu') {
        this.efloreService.get(this.occurrence.userSciName).subscribe(result => {
              this.efloreCard = this.parser.parseEfloreCard(result, this.occurrence.taxoRepo);
        });
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
    let url = `${this._identiplanteBaseUrl}/obs${this.occurrence.id}`
    window.open(url , '_blank');
  }

  publish() {
    let id = this.occurrence.id;
    this.dataSource.patch(id, {isPublic: true}).subscribe(
      data => {
          this.snackBar.open(
          "L'observation a été publiée avec succès.", 
          "Fermer", 
          { duration: 1500 });
          this.occurrence.isPublic = true;
      },
      error => {
        this.snackBar.open(
          'Une erreur est survenue. ' + error, 
          'Fermer', 
          { duration: 1500 });
        }
    )
  }
    isPublishable() {
      return (
          ( this.occurrence.certainty != null ) &&
          ( this.occurrence.locality != null || this.occurrence.geometry != null ) &&
          ( this.occurrence.dateObserved !== null) );
    }


  unpublish() {
    let id = this.occurrence.id;
    this.dataSource.patch(id, {isPublic: false}).subscribe(
      data => {
        this.snackBar.open(
          "L'observation a été dépubliée avec succès.", 
          "Fermer", 
          { duration: 1500 });
        this.occurrence.isPublic = false;
      },
    error => this.snackBar.open(
      'Une erreur est survenue. ' + error, 
      'Fermer', 
      { duration: 1500 })
    )
  }


  clone() {
    this.closeEvent.emit();
    let id = this.occurrence.id;
    this.dataSource.bulkCopy([id]).subscribe(
      data => {
        // The key in the JSON response for the current resource
        // is its relative URL:
        let key = `/${this._apiPrefix}/occurrences/${this.occurrence.id}`;
        // Retrieve the id of the duplicated occurrence from the JSON response:
        let duplicatedId = data[0][key].message.id;

        this.snackBar.open(
        "L'observation a été dupliquée avec succès.", 
        "Fermer", 
        { duration: 1500 });

        this.navigateToEditOccurrenceForm(duplicatedId);
      },
      error => this.snackBar.open(
        'Une erreur est survenue. ' + error, 
        'Fermer', 
        { duration: 1500 })
    )
  }

  buildDialogConfig() {
    let dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.hasBackdrop = true;
    return dialogConfig;
  }

  openConfirmDeletionDialog() {

    let dialogConfig = this.buildDialogConfig();
    dialogConfig.data = this._confirmDeletionMsg;
    let confirmDialogRef = this.confirmDialog.open(ConfirmDialogComponent, dialogConfig);

    confirmDialogRef
      .afterClosed()
      .subscribe( response => {
          if (response == true) {
            this.delete();
          }
      });
  }

  delete() {
    let id = this.occurrence.id;
    this.dataSource.delete(id).subscribe(
      data => {
        this.snackBar.open(
        "L'observation a été supprimée avec succès.", 
        "Fermer", 
        { duration: 1500 });
        this.occurrenceDeletedEvent.emit();
      },
      error => this.snackBar.open(
        'Une erreur est survenue. ' + error, 
        'Fermer', 
        { duration: 1500 })
    )
  }

  generatePdfEtiquette() {
    this.dataSource.generatePdfEtiquette([this.occurrence.id]).subscribe(resp => {
          this.downloadPdfEtiquette(resp);
        });
  }

  private downloadPdfEtiquette(data: any) {
    var blob = new Blob([data], { type: "application/pdf"});
    var url = window.URL.createObjectURL(blob);
    var pwa = window.open(url);
    //@todo use an angular material dialog
    if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
        alert( 'Merci de désactiver votre bloqueur de popups. Il empêche le téléchargement du fichier des étiquettes.');
    }
  }

  getPublishButtonTooltip() {
    return this.isPublishable() ? "Rendre publique l’observation" : "La publication n'est possible que pour les observations dont la localisation, la date et la certitude d'identification ont été renseignées.";

  }
  close() {
    this.closeEvent.emit();
  }

}
