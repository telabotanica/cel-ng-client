import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';
import { 
  MatDialogRef, 
  MatDialogConfig, 
  MatSnackBar,
  MatDialog } from "@angular/material";

import { Occurrence } from "../../../model/occurrence/occurrence.model";
import { OccurrencesDataSource } from "../../../services/occurrence/occurrences.datasource";
import { EfloreService } from "../../../services/eflore/eflore.service";
import { AlgoliaEfloreParserService } from "../../../services/eflore/algolia-eflore-parser.service";
import { EfloreCard } from "../../../model/eflore/eflore-card.model";

@Component({
  selector: 'app-occurrence-detail',
  templateUrl: './occurrence-detail.component.html',
  styleUrls: ['./occurrence-detail.component.css']
})
//@fixme: anuseless call with a perpage=3 is made on init... hunt and kill this! 
export class OccurrenceDetailComponent implements OnInit {

  id: number;
  occurrence: Occurrence;
  private subscription: Subscription;
  efloreCard: EfloreCard;

  constructor(
    private dataSource: OccurrencesDataSource, 
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog, 
    public snackBar: MatSnackBar,
    public efloreService: EfloreService,
    private parser: AlgoliaEfloreParserService) {}

  ngOnInit() {
    this.subscription = this.route.params.subscribe(params => {
       this.id = parseInt(params['id']);
       this.dataSource.get(this.id).subscribe(
            occurrence => this.occurrence = occurrence
        );
    });
    this.efloreService.get('Capscicum').subscribe(result => {
        this.efloreCard = this.parser.parseEfloreCard(result, 'bdtfx');
    });
  }

  navigateToEditOccurrenceForm() {
    this.router.navigate(['/occurrence-collection-edit-form', this.occurrence.id]);
  }

  openEfloreCard() {
    window.open(this.efloreCard.permalink , '_blank');;
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


  close() {

  }

  delete() {
    let id = this.occurrence.id;
    this.dataSource.delete(id).subscribe(
      data => {
        this.snackBar.open(
        "L'observation a été supprimée avec succès.", 
        "Fermer", 
        { duration: 1500 });
        this.close();
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
