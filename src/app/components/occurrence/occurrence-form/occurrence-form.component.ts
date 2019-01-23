import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute } from "@angular/router";
import { 
  MatDialogRef, 
  MatDialogConfig, 
  MatSnackBar,
  MatDialog } from "@angular/material";

import { LocationModel } from "tb-geoloc-lib/lib/_models/location.model";
import { RepositoryItemModel } from "tb-tsb-lib/lib/_models/repository-item.model";
import { FileData } from "tb-dropfile-lib/lib/_models/fileData.d";
import { Occurrence } from "../../../model/occurrence/occurrence.model";
import { TelaBotanicaProject } from "../../../model/occurrence/tela-botanica-project.model";
import { OccurrenceFilters } from "../../../model/occurrence/occurrence-filters.model";
import { OccurrencesDataSource } from "../../../services/occurrence/occurrences.datasource";
import { TaxonomicRepositoryService } from "../../../services/occurrence/taxonomic-repository.service";
import { PlantnetService } from "../../../services/plantnet/plantnet.service";
import { ExistInChorodepService } from "../../../services/chorodep/exist-in-chorodep.service";
import { TelaBotanicaProjectService } from "../../../services/occurrence/tela-botanica-project.service";
import { OccurrenceBuilder } from "../../../utils/occurrence-builder.utils";
import { EfloreCardUrlBuilder } from "../../../utils/eflore-card-url-builder.utils";
import { ConfirmDialogComponent } from "../../../components/occurrence/confirm-dialog/confirm-dialog.component";

@Component({
  selector: 'app-occurrence-form',
  templateUrl: './occurrence-form.component.html',
  styleUrls: ['./occurrence-form.component.css']
})
export class OccurrenceFormComponent implements OnInit {

  // Constant for storing the three different mode values fir this form:
  private static readonly CREATE_MODE      = "create";
  private static readonly SINGLE_EDIT_MODE = "single edit";
  private static readonly BULK_EDIT_MODE   = "multi edit";

  // FORM GROUP:
  occurrenceForm: FormGroup;

  // FORM OPTIONS:
  // Show advanced (full) form (or basic one): 
  displayFullFormLeft  = false;
  displayFullFormRight = false;
  clearFormAfterSubmit = false;
  // Let's default to create mode:
  mode: string = OccurrenceFormComponent.CREATE_MODE;

  // USED/MANAGED MODELS:
  projects: TelaBotanicaProject[];
  occurrences = [];
  private location: LocationModel;
  private taxon: RepositoryItemModel;
  private subscription: Subscription;

  constructor(
    private dataService:OccurrencesDataSource,
    private taxoRepoService: TaxonomicRepositoryService,
    private plantnetService: PlantnetService,
    private existInChorodepService: ExistInChorodepService,
    private tbPrjService: TelaBotanicaProjectService,
    private dialog: MatDialog, 
    private confirmDialog: MatDialog, 
    public snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() { 
   
    this.initFormGroup();
    this.initOccurrencesToEdit();
    this.tbPrjService.getCollection().subscribe(
      tbProjects => this.projects = tbProjects
    );
  }

  private initFormGroup() {
    this.occurrenceForm = new FormGroup({
      certainty:            new FormControl(),
      dateObserved:         new FormControl(),
      isPublic:             new FormControl(),
      annotation:           new FormControl(),
      publishedLocation:    new FormControl(),
      occurrenceType:       new FormControl(),
      phenology:            new FormControl(),
      observer:             new FormControl(),
      observerInstitution:  new FormControl(),
      isWild:               new FormControl(),
      coef:                 new FormControl(),
      herbariumSample:      new FormControl(),
      locationAccuracy:     new FormControl(),
      sublocality:          new FormControl(),
      environment:          new FormControl(),
      station:              new FormControl(),
      bibliographySource:   new FormControl(),
    });
  }

  async retrieveOccurrences(ids) {
    for (let id of ids) {  
      let ctOcc = await this.retrieveOccurrence(id);
      this.occurrences.push(ctOcc);
    }
    if ( this.occurrences.length > 0 ) {
      this.prepopulateForm();
    }
  }

  displayEfloreCard() {
    let url = EfloreCardUrlBuilder.build(
      this.taxon.idTaxo,
      this.taxon.repository);
    window.open(url,'_blank');
  }

  isEfloreCardDisplayable() {
    return false;
  }

  openConfirmActionDialog(value) {

    let dialogConfig = this.buildDialogConfig();
    let confirmQuestion = this.generateConfirmQuestionFromMode();
    dialogConfig.data = confirmQuestion;
    let confirmDialogRef = this.confirmDialog.open(ConfirmDialogComponent, dialogConfig);

    confirmDialogRef
      .afterClosed()
      .subscribe( response => {
          if (response == true) {
            this.formSubmitted(value);
          }
      });
  }


  private generateConfirmQuestionFromMode() {
    let confirmQuestion = '';
    if ( this.mode == OccurrenceFormComponent.CREATE_MODE ) {
      confirmQuestion = "Enregistrer l'observation ?";
    }
    else if ( this.mode == OccurrenceFormComponent.SINGLE_EDIT_MODE ) {
      confirmQuestion = "Modifier l'observation ?";
    }
    else if ( this.mode == OccurrenceFormComponent.BULK_EDIT_MODE ) {
      confirmQuestion = "Modifier les observation ?";
    }

    return confirmQuestion;
  }

  buildDialogConfig() {
    let dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.hasBackdrop = true;
    return dialogConfig;
  }

  private navigateToDetail(id: number) {
    this.router.navigate(['/occurrence-detail', id]);
  }

  navigateToHelp() {
    this.router.navigateByUrl('/help');
  }

  private navigateToOccurrenceUi() {
    this.router.navigateByUrl('/occurrence-ui');
  }

  /**
   * Retrieves the string encoded ids (no array route parameters in angular
   * at the moment) and loads corresponding Occurrence resources from the WS 
   * to fill the 'occurrences' array property. Also sets the "mode" of the
   * form: either CREATE_MODE,  SINGLE_EDIT_MODE or BULK_EDIT_MODE.
   */
  private initOccurrencesToEdit() {
    this.route.params.subscribe(params => {
      // Retrieve the string encoded ids parameter from the route: 
      let strIds = params['ids']; 
      
      if ( strIds !== undefined ) {
        // Edit mode:
        let ids = strIds.split(",");
        if (ids.length >1) {
          this.mode = OccurrenceFormComponent.BULK_EDIT_MODE;
        }
        else {
          this.mode = OccurrenceFormComponent.SINGLE_EDIT_MODE;
        }
        this.retrieveOccurrences(ids); 
      }
      else {
        // Create mode:
        this.mode = OccurrenceFormComponent.CREATE_MODE;
      }
      
    });
  }

  async retrieveOccurrence(id) {
    const resp = await this.dataService.get(parseInt(id)).toPromise();
    return resp;
  }

  private prepopulateForm() {
    let occurrence: Occurrence;
    if ( this.occurrences.length == 1 ) {
      occurrence = this.occurrences[0];
    }
    else {
      occurrence = this.buildPrepopulateOccurrence();
    }
    this.occurrenceForm.patchValue(occurrence);
  }

  private buildPrepopulateOccurrence() {
    let prepopOcc = new Occurrence();
    let testOcc = this.occurrences[0];

    // Let's loop around the ccurrence properties
    for ( var propertyName in testOcc ) {
      // If this is an "own property":
      if ( testOcc.hasOwnProperty(propertyName) ) {
        let areDifferent = false;
        
        for( let occ of this.occurrences ){
          if ( occ[propertyName] !== testOcc[propertyName] ) {
            areDifferent = true;
          }
        }
        // If the values of the propery are equal, we want to prepopulate
        // the form field value with it:
        if ( !areDifferent ) {
          prepopOcc[propertyName] = testOcc[propertyName];
        }
        else {
          prepopOcc[propertyName] = "Valeurs multiples";
        }
      }
    }
    return prepopOcc;
  }

  isInCreateMode() {
    return ( this.mode == OccurrenceFormComponent.CREATE_MODE );
  }

  toggleAdvancedFormLeft(event) {
    this.displayFullFormLeft = !this.displayFullFormLeft;
  }

  toggleAdvancedFormRight(event) {
    this.displayFullFormRight = !this.displayFullFormRight;
  }

  toggleClearFormAfterSubmit(event) {
    this.clearFormAfterSubmit = !this.clearFormAfterSubmit;
  }

  onPhotoAdded(photo: FileData) {

  }

  onPhotoRejected(photo: FileData) {
  }

  onLocationChange(location: LocationModel) {
    this.location = location;
    console.debug(this.location);
  }

  onTaxonChange(taxon: RepositoryItemModel) {
    this.taxon = taxon;
  }

  addPhoto(location: RepositoryItemModel) {
  }

  removePhoto(location: RepositoryItemModel) {

  }

  isPublishable() {
    return (
      this.occurrenceForm.controls['certainty'].value != null && 
      this.location != null &&
      this.occurrenceForm.controls['dateObserved'].value !==null);
  }

  onCancel() {
    this.navigateToOccurrenceUi();
  }

  private clearForm() {
    this.occurrenceForm.reset();
  }

  private populateForm(occ: Occurrence) {
    this.occurrenceForm.patchValue(occ);
  }

  private postOccurrence(occ: Occurrence) {
    this.dataService.post(occ).subscribe(
      result => {
        this.snackBar.open(
          "L'observation vient d'être créée.", 
          'Fermer', 
          { duration: 1500 });
        if ( this.clearFormAfterSubmit ) {
          this.clearForm();
        }
      },
      error => {
        this.snackBar.open(
          'Une erreur est survenue. ' + error, 
          'Fermer', 
          { duration: 1500 });
      }
    );
  }

  private patchOccurrence(occ: Occurrence) {
    this.dataService.patch(occ.id, occ).subscribe(
      result => {
        this.snackBar.open(
          "L'observation a bien été modifiée.", 
          'Fermer', 
          { duration: 1500 });
        this.navigateToDetail(occ.id)
      },
      error => {
        this.snackBar.open(
          'Une erreur est survenue. ' + error, 
          'Fermer', 
          { duration: 1500 });
      }
    );
  }

  private bulkReplaceOccurrences(
    occurrencesToBePatched: Occurrence[], occ: Occurrence) {

    let ids = occurrencesToBePatched.map(function(occurrence) {
      return occurrence.id;
    });

    this.dataService.bulkReplace(ids, occ).subscribe(
      result => {
        this.snackBar.open(
          "Les observations ont bien été modifiées.", 
          'Fermer', 
          { duration: 1500 });
        this.navigateToOccurrenceUi();
      },
      error => {
        this.snackBar.open(
          'Une erreur est survenue. ' + error, 
          'Fermer', 
          { duration: 1500 });
      }
    );
  }

  //@refactor: Change name
  formSubmitted(occurrenceFormValue) {
    let occBuilder = new OccurrenceBuilder(
      occurrenceFormValue, 
      this.taxon, 
      this.location,
      this.taxoRepoService);
    let occ = occBuilder.build();
    // The component has been instanciated with at least one
    // occurrence. We're in 'update/edit' mode:
    if ( this.occurrences.length>0 ) {
      // multiple occurrences, let's json-patch replace!
      if ( this.occurrences.length>1 ) {
        this.bulkReplaceOccurrences(this.occurrences, occ);
      }
      // single occurrence, let's patch!
      else {
        this.patchOccurrence(occ);
      }
    }
    // No occurrences loaded on init, we're in 'create' mode
    else {
      // Let's post to the REST service:
      this.postOccurrence(occ);
    }
  }


  showPlantNetDialog() {
/*
    this.plantnetService.get(
      ['http://tropical.theferns.info/plantimages/sized/c/a/ca2b39f905c0890b8db7f6c6dec34d70f37e089a_960px.jpg'], 
      ['fruit'], 
      'fr').subscribe(
        resp => console.debug(resp)
    );
*/
  }

  isPlantNetCallable() {

  }

   private existsInChorodep() {
/*
    return this.existInChorodepService.get(
        this.taxon.repository, 
        this.taxon.idTaxo,
        this.location,
        34);
*/
    return true;
  }

  private doublonExists(    
    userId:string, 
    dateObservedDay: string,
    dateObservedMonth: string,
    dateObservedYear: string,
    userSciName: string,
    geometry: string,
    locality: string) {

    let filters = new OccurrenceFilters();

    filters.signature = this.generateSignature(
        userId, dateObservedDay, dateObservedMonth, dateObservedYear,
        userSciName, geometry, locality);

    let doublonExists = this.dataService.findOccurrences(
        null, null, 1, 2, filters).map(
          occurrences => {
            return ( occurrences.length>0 );
        });
    return true;
  }

  private generateSignature(
    userId:string, 
    dateObservedDay: string,
    dateObservedMonth: string,
    dateObservedYear: string,
    userSciName: string,
    geometry: string,
    locality: string) {

    let signatureBits = [
      userId, dateObservedMonth, 
      dateObservedDay, dateObservedYear, 
      userSciName, geometry, locality];
    let unencodedSignature = '';

    for(let bit of signatureBits) {
        unencodedSignature = unencodedSignature + '-' + bit;
    }

    return btoa(unencodedSignature);
  }


  private createPhotos(photos: FileData[]) {

  }

  private createPhoto(photo: FileData) {

  }
 

}
