import { Component, OnInit } from '@angular/core';
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
import { ConfirmDialogComponent } from "../../../components/occurrence/confirm-dialog/confirm-dialog.component";
import { EfloreCard } from "../../../model/eflore/eflore-card.model";

@Component({
  selector: 'app-occurrence-detail',
  templateUrl: './occurrence-detail.component.html',
  styleUrls: ['./occurrence-detail.component.css']
})
export class OccurrenceDetailComponent implements OnInit {

  id: number;
  occurrence: Occurrence;
  private subscription: Subscription;
  efloreCard: EfloreCard;
  baseTagLibBaseUrl: string = environment.api.tagLibBaseUrl;
  private _confirmDeletionMsg: string = 'Supprimer la/les observation(s) ?';

  constructor(
    private dataSource: OccurrencesDataSource, 
    private route: ActivatedRoute,
    private router: Router,
    private confirmDialog: MatDialog, 
    public snackBar: MatSnackBar,
    public efloreService: EfloreService,
    private parser: AlgoliaEfloreParserService) {}

  ngOnInit() {
    this.subscription = this.route.params.subscribe(params => {
       this.id = parseInt(params['id']);
       this.dataSource.get(this.id).subscribe(
          occurrence => {this.occurrence = occurrence;
            console.debug(this.occurrence);
            if (occurrence.userSciName != null && occurrence.taxoRepo !=null && occurrence.taxoRepo != 'Autre/inconnu') {
              this.efloreService.get(occurrence.userSciName).subscribe(result => {
                    this.efloreCard = this.parser.parseEfloreCard(result, occurrence.taxoRepo);
                });
              }
            }
        );
    });


  }

  navigateToEditOccurrenceForm() {
    this.router.navigate(['/occurrence-collection-edit-form', this.occurrence.id]);
  }

  _navigateToOccurrenceUi() {
    this.router.navigate(['/occurrence-ui']);
  }

  openEfloreCard() {
    window.open(this.efloreCard.permalink , '_blank');
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  publish() {
    let id = this.occurrence.id;
    this.dataSource.patch(id, {isPublic: false}).subscribe(
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
    let id = this.occurrence.id;
    this.dataSource.bulkCopy([id]).subscribe(
      data => {
        this.snackBar.open(
        "L'observation a été dupliquée avec succès.", 
        "Fermer", 
        { duration: 1500 });
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
        this._navigateToOccurrenceUi();
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


}
