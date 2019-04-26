import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute } from "@angular/router";
import { 
  MatDialogRef, 
  MatDialogConfig, 
  MatSnackBar,
  MatDialog } from "@angular/material";

import { TbLog } from "tb-tag-lib/lib/_models/tb-log.model";
import { LocationModel } from "tb-geoloc-lib/lib/_models/location.model";
import { RepositoryItemModel } from "tb-tsb-lib/lib/_models/repository-item.model";
import { FileData } from "tb-dropfile-lib/lib/_models/fileData.d";
import { environment } from '../../../../environments/environment';
import { Occurrence } from "../../../model/occurrence/occurrence.model";
import { PlantnetResponse } from "../../../model/plantnet/plantnet-response.model";
import { TelaBotanicaProject } from "../../../model/occurrence/tela-botanica-project.model";
import { OccurrenceFilters } from "../../../model/occurrence/occurrence-filters.model";
import { OccurrencesDataSource } from "../../../services/occurrence/occurrences.datasource";
import { PhotoService } from "../../../services/photo/photo.service";
import { PlantnetService } from "../../../services/plantnet/plantnet.service";
import { ExistInChorodepService } from "../../../services/chorodep/exist-in-chorodep.service";
import { TelaBotanicaProjectService } from "../../../services/occurrence/tela-botanica-project.service";
import { OccurrenceBuilder } from "../../../utils/occurrence-builder.utils";
import { EfloreCardUrlBuilder } from "../../../utils/eflore-card-url-builder.utils";
import { ConfirmDialogComponent } from "../../../components/occurrence/confirm-dialog/confirm-dialog.component";
import { OccurrenceLinkPhotoDialogComponent } from '../occurrence-link-photo-dialog/occurrence-link-photo-dialog.component';
import { PlantnetResultDialogComponent } from '../plantnet-result-dialog/plantnet-result-dialog.component';

@Component({
  selector: 'app-occurrence-form',
  templateUrl: './occurrence-form.component.html',
  styleUrls: ['./occurrence-form.component.css']    
})
export class OccurrenceFormComponent implements OnInit {

  // -----------------------------------------------------------------
  // CONSTANTS (storing the three different mode names for this form):
  // -----------------------------------------------------------------
  private static readonly CREATE_MODE      = "create";
  private static readonly SINGLE_EDIT_MODE = "single edit";
  private static readonly BULK_EDIT_MODE   = "multi edit";

  // -----------
  // FORM GROUP:
  // -----------
  occurrenceForm: FormGroup;

  // --------------------
  // USED/MANAGED MODELS:
  // --------------------
  // The list of TelaBotanicaProject 
  projects: TelaBotanicaProject[];
  occurrences = [];
  // The photos which have been uploaded for the current occurrence(s):
  private photos = [];
  // The LocationModel object as defined by th user 
  private location: LocationModel;
  // The RepositoryItemModel (taxon) object as chosen by the user:
  private taxon: RepositoryItemModel;

  // ----------------------------------------------------------------
  // PATCH MEMBER VARIABLES (to initiate children component values) :
  // ----------------------------------------------------------------
  // Edit mode only (both single and multi): these instances are used to
  // prepopulate the taxonomic search box and geoloc map components and that's
  // it. Once instanciated, those variable values must never change: 
  // the children components are now responsible for selecting the 
  // taxon/location. 
  patchTaxon: RepositoryItemModel;
  patchElevation: number;
  patchGeometry;
  patchAddress: string;
  patchLatLngDec: Array<number>;

  // -------------
  // FORM OPTIONS:
  // -------------
  // Should the form be cleared after SUBMIT? (create mode only):
  clearFormAfterSubmit = false;
  // Let's default to create mode:
  mode: string = OccurrenceFormComponent.CREATE_MODE;
  // Should the form be reset?
  resetForm: boolean;
  // Configuration values for Stephane's modules: 
  tagObjectId: number = null;
  baseCelApiUrl: string = environment.api.baseUrl;
  tagLibBaseUrl: string = environment.api.tagLibBaseUrl;
  elevationApiProvider: string = environment.elevationApi.provider;
  mapBgTileUrl: string = environment.mapBgTile.baseUrl;
  autoSelectValueIfOnlyOneResult: boolean = false;
  // Shuld the advanced forms be displayed instead of basic ones: 
  displayFullFormLeft  = false;
  displayFullFormRight = false;
  readonly maxDate: Date = new Date();

  // ---------------
  // LIST VALUES:
  // ---------------
  isWildList = [
    { "name": "Sauvage", "value": true},
    { "name": "Cultivée", "value": false}
  ]

  // ---------------
  // DEFAULT VALUES:
  // ---------------
  occurrenceTypeSelected: string    = "observation de terrain";
  publishedLocationSelected: string = "précise"; 
  isWildSelected: boolean           = true;

  // List of repositories for the taxon selection module:
  tbRepositoriesConfig = [
    {
      id: 'bdtfx',
      label: 'Métropole',
      levels: ['idiotaxon'],
      apiUrl: environment.taxoApi.nameSearchBaseUrl + '/bdtfx/',
      apiUrl2: '',
      apiUrlValidOccurence: environment.taxoApi.validationBaseUrl + '/bdtfx/noms/',
      description_fr: ''
    }, {
      id: 'bdtfxr',
      label: 'Métropolole (index réduit)',
      levels: ['idiotaxon'],
      apiUrl: environment.taxoApi.nameSearchBaseUrl + '/bdtfxr/',
      apiUrl2: '',
      apiUrlValidOccurence: environment.taxoApi.validationBaseUrl + '/bdtfxr/noms/',
      description_fr: ''
    }, {
      id: 'nva',
      label: 'Antilles françaises',
      levels: ['idiotaxon'],
      apiUrl: environment.taxoApi.nameSearchBaseUrl + '/nva/',
      apiUrl2: '',
      apiUrlValidOccurence: environment.taxoApi.validationBaseUrl + '/nva/noms/',
      description_fr: ''
    }, {
      id: 'bdtre',
      label: 'Réunion',
      levels: ['idiotaxon'],
      apiUrl: environment.taxoApi.nameSearchBaseUrl + '/bdtre/',
      apiUrl2: '',
      apiUrlValidOccurence: environment.taxoApi.validationBaseUrl + '/bdtre/noms/',
      description_fr: ''
    }, {
      id: 'florical',
      label: 'Nouvelle-Calédonie',
      levels: ['idiotaxon'],
      apiUrl: environment.taxoApi.nameSearchBaseUrl + '/florical/',
      apiUrl2: '',
      apiUrlValidOccurence: environment.taxoApi.validationBaseUrl + 'florical/noms/',
      description_fr: ''
    }, {
      id: 'aublet',
      label: 'Guyane',
      levels: ['idiotaxon'],
      apiUrl: environment.taxoApi.nameSearchBaseUrl + '/aublet/',
      apiUrl2: '',
      apiUrlValidOccurence: environment.taxoApi.validationBaseUrl + '/aublet/noms/',
      description_fr: ''
    }, {
      id: 'apd',
      label: 'Afrique',
      levels: ['idiotaxon'],
      apiUrl: environment.taxoApi.nameSearchBaseUrl + '/apd/',
      apiUrl2: '',
      apiUrlValidOccurence: environment.taxoApi.validationBaseUrl + '/apd/noms/',
      description_fr: ''
    }, {
      id: 'lbf',
      label: 'Liban',
      levels: ['idiotaxon'],
      apiUrl: environment.taxoApi.nameSearchBaseUrl + 'lbf/',
      apiUrl2: '',
      apiUrlValidOccurence: environment.taxoApi.validationBaseUrl + '/lbf/noms/',
      description_fr: ''
    }
];

  private linkPhotoToOccDialogRef: MatDialogRef<OccurrenceLinkPhotoDialogComponent>;
  private plantnetResultDialogRef: MatDialogRef<PlantnetResultDialogComponent>;
  private subscription: Subscription;

  constructor(
    private dataService:            OccurrencesDataSource,
    private photoService:           PhotoService, 
    private plantnetService:        PlantnetService,
    private existInChorodepService: ExistInChorodepService,
    private tbPrjService:           TelaBotanicaProjectService,
    private dialog:                 MatDialog, 
    private confirmDialog:          MatDialog, 
    public  snackBar:               MatSnackBar,
    private route:                  ActivatedRoute,
    private router:                 Router) { 
  }

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
      sampleHerbarium:      new FormControl(),
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

  async retrieveOccurrence(id) {
    const resp = await this.dataService.get(parseInt(id)).toPromise();
    return resp;
  }

  displayEfloreCard() {
    let url = EfloreCardUrlBuilder.build(
      this.taxon.repository,
      this.taxon.idNomen);
    window.open(url, '_blank');
  }

  isEfloreCardDisplayable() {
    return ( this.taxon );
  }

  isTagComponentDisplayable() {
    // Only when creating a new occurrence or editing a single occurrence:
    return  ( ! (this.occurrences && this.occurrences.length>1) );
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
            this.postOrPatch(value);
          }
      });
  }


  delayTagApiCalls() {
     return ( this.mode == OccurrenceFormComponent.CREATE_MODE );
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
   * form to one of the class member constant: either CREATE_MODE,  
   * SINGLE_EDIT_MODE or BULK_EDIT_MODE.
   */
  private initOccurrencesToEdit() {
    this.route.params.subscribe(params => {
      // Retrieve the string encoded ids parameter from the route: 
      let strIds = params['ids']; 

      // Edit mode:
      if ( strIds !== undefined ) {
        // Bulk edit mode:
        let ids = strIds.split(",");
        if (ids.length >1) {
          this.mode = OccurrenceFormComponent.BULK_EDIT_MODE;
        }
        // Single edit mode:
        else {
          this.tagObjectId = ids[0];
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


  private prepopulateForm() {

    let occurrence: Occurrence;
    if ( this.occurrences.length == 1 ) {
      occurrence = this.occurrences[0];
      //@todo: temporary ugly fix for CST tests, why the hell does the WS return the nbr as string?!!!
      if ( typeof occurrence.elevation === "string" ) {
        occurrence.elevation = Number(occurrence.elevation);
      }

    }
    else {
      occurrence = this.buildPrepopulateOccurrence();
    }
    this.occurrenceForm.patchValue(occurrence);
    this.prepopulateLocation(occurrence);

    if ( occurrence.taxoRepo != null && occurrence.userSciNameId != null ) {
      this.prepopulateTaxoSearchBox(occurrence);
    }
    
    if ( occurrence.geometry != "Valeurs multiples" ) {
      this.prepopulateGeolocMap(occurrence);
    }
    
  }

  private prepopulateTaxoSearchBox(occ: Occurrence) {

    // Create a dummy temp taxon not to fire change event
    // for every property setting.
    let tmpTaxon = {
      occurenceId: occ.id,
      repository: (occ.taxoRepo == null) ? '' : occ.taxoRepo,
      idNomen: occ.userSciNameId,
      name: occ.userSciName,
      author: ''
    }

    // Update the class member and, consequently, the search box component: 
    this.patchTaxon = tmpTaxon;
  }

  private prepopulateGeolocMap(occ: Occurrence) {
    let jsonGeom = JSON.parse(occ.geometry); 
    this.patchElevation = occ.elevation;
    this.patchGeometry = [{
      'type': jsonGeom.type,
      'coordinates': jsonGeom.coordinates
    }];
    console.debug(this.patchGeometry);
    this.patchAddress = occ.locality;
    if ( jsonGeom.type == 'Point' ) {
        this.patchLatLngDec = jsonGeom.coordinates;
    }
  }

  private prepopulateLocation(occ: Occurrence) {
    
    // only useful so that the location is not null when the component is 
    // loaded in single edit mode. This will allow the isPublishable() method
    // to eventually returning true.    
    this.location = {
      "geometry": JSON.parse(occ.geometry),
      "locality": occ.locality,
      "elevation": occ.elevation,
      "station": occ.station,
      "geodatum": occ.geodatum,
      "publishedLocation": occ.publishedLocation,
      "locationAccuracy": null,
      "sublocality": occ.sublocality,
      "osmState": occ.osmState,
      "osmCountry": occ.osmCountry,
      "osmCountryCode": occ.osmCountryCode,	
      "osmCounty": occ.osmCounty,
      "osmId": Number(occ.osmId),
      "inseeData": null,
      "osmPostcode": Number(occ.osmPostcode),
      "localityConsistency": false,
      "osmPlaceId": occ.osmPlaceId
    };

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
          if (propertyName == "taxoRepo") {
            prepopOcc[propertyName] = "Autre/inconnu";
          }
          else {
            prepopOcc[propertyName] = "Valeurs multiples";
          }
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
console.debug(photo);
  }

  onPhotoRejected(photo: FileData) {
  }

  onPhotoUploaded(photo: any) {
    console.debug(photo);
      this.photos.push(photo);
      this.snackBar.open(
        "La photo " + photo.originalName + " a été enregistrée avec succès.", 
        'Fermer', 
        { duration: 2500 });
  }


  private linkPhotosToOccurrence(occurrenceId) {

    const photoIds = this.photos.map(photo => photo.id);
    this.photoService.bulkReplace(photoIds, {occurrence:{id:occurrenceId}}).subscribe(
      data => {
        this.snackBar.open(
        "Les photos et l’observation ont été liées avec succès.", 
        "Fermer", 
        { duration: 2500 });
      },
      error => this.snackBar.open(
        'Une erreur est survenue. ' + error, 
        'Fermer', 
        { duration: 2500 })
    );
  }


  onLocationChange(location: LocationModel) {
    this.location = location;
    console.debug(this.location);
  }

  onTaxonChange(taxon: RepositoryItemModel) {
    this.taxon = taxon;
  }

  onTagRemoved(tag: any) {
    console.debug(tag);
  }

  onPostTagError(error: any) {
    console.debug(error);
  }

  onPostPhotoError(error: any) {
    console.debug(error);
  }

  onTagAdded(tag: any) {
    console.debug(tag);
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
    // Ask children components to reset themselves:
    this.resetTbLibComponents();
    this.taxon     = null;
    this.location  = null;
  }

  private resetTbLibComponents() {
    this.resetForm = true;
    setTimeout(() => {
      this.resetForm = false;
    }, 1000);
  }



  private async preSubmitValidation(): Promise<string[]> {
    let warnings = new Array();
    let dateObserved = this.occurrenceForm.controls['dateObserved'].value;

    // If we've got all the data we need to check existence in chorodep:
    if ( this.taxon != null && this.location != null ) {
      this.snackBar.open(
        "Validation préalable lancée (recherche de doublons, vérification de présence dans la chorologie départementale).", 
        'Fermer', 
        { duration: 2500 });
      if ( this.location.inseeData != null ) {
          let frenchDept = this.location.inseeData.code.substr(0, 2);
          let existsInChorodep = await this.existsInChorodep();

          if (existsInChorodep == "0") {
            let msg = "Attention, le taxon " + this.taxon.name + " n'est pas signalé par la chorologie dans le département " + frenchDept + ". Si vous êtes sûr de votre observation, vous pouvez signaler votre découverte à la liste chorologie à l'adresse : chorologie@tela-botanica.org. ";
            warnings.push(msg);
          }
      }
      // If we've got all the data we need to check duplicate existence:
      if ( dateObserved != null ) {
        let month = dateObserved.getUTCMonth() + 1;
        let day = dateObserved.getUTCDate();
        let year = dateObserved.getUTCFullYear();
        // @todo use the user id from the token once we can test with SSO:
        let duplicateExists = await this.doublonExists(    
            '22', day, month, year, this.taxon.name,
            this.location.geometry, this.location.locality);

        if (duplicateExists) {
          warnings.push("Vous avez déjà saisi une observation identique dans votre CEL. Merci de vérifier les informations saisies avant de poursuivre.");
        }
      }
    }

    return warnings;
  }


  private async postOccurrenceAfterWarningConfirmation(occ: Occurrence) {

    let warnings = await this.preSubmitValidation();
    if ( warnings.length > 0) {
      let msg = "";

      for (let warning of warnings) {
        msg += warning;
      }
      msg += " Continuer ?";
      let dialogConfig = this.buildDialogConfig();
      dialogConfig.data = msg;
      let confirmDialogRef = this.confirmDialog.open(ConfirmDialogComponent, dialogConfig);

      confirmDialogRef
        .afterClosed()
        .subscribe( response => {
            if (response == true) {
              this.postOccurrence(occ);
            }
        });
    }
    else {
      // Let's post the occurrence to the REST service:
      this.postOccurrence(occ);
    }

  }

  private postOccurrence(occ: Occurrence) {

    this.dataService.post(occ).subscribe(
      result => {
        this.snackBar.open(
          "L'observation vient d'être créée.", 
          'Fermer', 
          { duration: 2500 });
        if ( this.photos.length > 0 ) {
          this.linkPhotosToOccurrence(occ.id); 
        }
        this.photos = [];
        if ( this.clearFormAfterSubmit ) {
          this.clearForm();
        }
      },
      error => {
        this.snackBar.open(
          'Une erreur est survenue. ' + error, 
          'Fermer', 
          { duration: 2500 });
      }
    );
  }

  private patchOccurrence(occ: Occurrence) {

    this.dataService.patch(occ.id, occ).subscribe(
      result => {
        this.snackBar.open(
          "L'observation a bien été modifiée.", 
          'Fermer', 
          { duration: 2500 });
        this.navigateToDetail(occ.id)
      },
      error => {
        this.snackBar.open(
          'Une erreur est survenue. ' + error, 
          'Fermer', 
          { duration: 2500 });
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
          { duration: 2500 });
        this.navigateToOccurrenceUi();
      },
      error => {
        this.snackBar.open(
          'Une erreur est survenue. ' + error, 
          'Fermer', 
          { duration: 2500 });
      }
    );
  }

  //@refactor: use newly introduced form 'mode' instead of counting occurrences
  async postOrPatch(occurrenceFormValue) {

    let occBuilder = new OccurrenceBuilder(
      occurrenceFormValue, 
      this.taxon, 
      this.location);
    let occ = await occBuilder.build();

    // The component has been instanciated with at least one
    // occurrence. We're in 'update/edit' mode:
    if ( this.occurrences.length>0 ) {
      // multiple occurrences, let's json-patch replace!
      if ( this.occurrences.length>1 ) {
        this.bulkReplaceOccurrences(this.occurrences, occ);
      }
      // single occurrence, let's patch!
      else {
        occ.id = this.occurrences[0].id;
console.debug(occ);

        this.patchOccurrence(occ);
      }
    }
    // No occurrences loaded on init, we're in 'create' mode
    else {
      this.postOccurrenceAfterWarningConfirmation(occ);
      
      // Let's post to the REST service:
      //this.postOccurrence(occ);
    }
  }


  askPlantNet() {
    const photoUrls = this.photos.map(photo => photo.url);
    this.plantnetService.get(
      photoUrls, 
      ['leaf'], 
      'fr').subscribe(
        resp => {
            console.debug(resp);
          this.autoSelectValueIfOnlyOneResult = true;
          this.openPlantNetDialog(resp);
        }
    );

  }

  fillTaxofromPlantnetChoice(taxon: RepositoryItemModel) {
    this.patchTaxon = taxon;
    this.autoSelectValueIfOnlyOneResult = false;
  }

  openPlantNetDialog(result: PlantnetResponse) {

    this.plantnetResultDialogRef = this.dialog.open(PlantnetResultDialogComponent, {
      data:  result
    });
    this.plantnetResultDialogRef
      .afterClosed()
      .subscribe(
        taxon => {
          // Taxon suggestion selected, let's fill the tb-tsb-lib component:
          if (taxon) {
            this.fillTaxofromPlantnetChoice(taxon);
          }
          // The close button has been clicked, no taxon suggestion selected:
          else {
            // Switch the tb-tsb-lib component to default mode:
            this.autoSelectValueIfOnlyOneResult = false;
          }
        }
    );

  }



  isPlantNetCallable() {
    return (this.photos.length > 0);
  }

   private async existsInChorodep() {

    if ( this.taxon != null && 
      this.location != null && 
      this.location.osmCountry != null && 
      this.location.inseeData != null &&
      this.location.inseeData.code != null &&
      this.location.inseeData.code.length >=2 ) {
console.log('ppppppppppppppppppppppppppppppppppppppppppppppppppppppppp');
      let taxonId: number;
      let frenchDept = this.location.inseeData.code.substr(0, 2);

      if (typeof this.taxon.idNomen === 'string') {
          taxonId= parseInt(this.taxon.idNomen);
      } else {
          taxonId = this.taxon.idNomen;
      }
      return this.existInChorodepService.get(
          this.taxon.repository, 
          taxonId,
          this.location.osmCountry,
          '34').toPromise();
    }
    return null;
  }

  private async doublonExists(    
    userId:string, 
    dateObservedDay: string,
    dateObservedMonth: string,
    dateObservedYear: string,
    userSciName: string,
    geometry: string,
    locality: string) {

    let filters = new OccurrenceFilters();

    filters.signature = this.generateSignature(
        userId, dateObservedDay, dateObservedMonth, 
        dateObservedYear, userSciName, geometry, locality);

    return this.dataService.findOccurrences(
        null, null, 1, 2, filters).map(
          occurrences => {
            return ( occurrences.length>0 );
        }).toPromise();
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

  openLinkPhotoDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '500px';
    dialogConfig.width = '900px';
    dialogConfig.maxHeight = 500;
    dialogConfig.maxWidth = 900;
    dialogConfig.hasBackdrop = true;
    this.linkPhotoToOccDialogRef = this.dialog.open(OccurrenceLinkPhotoDialogComponent, dialogConfig);

    this.linkPhotoToOccDialogRef
      .afterClosed()
      .subscribe(
        photo => this.photos.push(photo)
    );

  }


  logTagLibMessages(log: TbLog) {
    if (log.type === 'info') {
      // tslint:disable-next-line:no-console
      console.info(log.message_fr);
    } else if (log.type === 'success') {
      console.log(log.message_fr);
    } else if (log.type === 'warning') {
      console.warn(log.message_fr);
    } else if (log.type === 'error') {
      console.error(log.message_fr);
    }
  }

  private createPhotos(photos: FileData[]) {

  }

  private createPhoto(photo: FileData) {

  }
 

}
