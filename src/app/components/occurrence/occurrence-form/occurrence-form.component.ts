import {
    Component,
    OnInit,
    Output,
    EventEmitter,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {
    FormGroup,
    FormControl
} from '@angular/forms';
import {
    Subscription
} from 'rxjs/Subscription';
import {
    Router,
    ActivatedRoute
} from "@angular/router";
import {
    MatDialogRef,
    MatDialogConfig,
    MatSnackBar,
    MatDialog
} from "@angular/material";
import {
    Inject
} from '@angular/core';
import {
    DOCUMENT
} from '@angular/common';
import * as jwt_decode from "jwt-decode";

import {
    TbLog
} from "tb-tag-lib/lib/_models/tb-log.model";
import {
    LocationModel
} from "tb-geoloc-lib/lib/_models/location.model";
import {
    RepositoryItemModel
} from "tb-tsb-lib/lib/_models/repository-item.model";
import {
    FileData
} from "tb-dropfile-lib/lib/_models/fileData.d";
import {
    environment
} from '../../../../environments/environment';
import {
    Occurrence
} from "../../../model/occurrence/occurrence.model";
import {
    Photo
} from "../../../model/photo/photo.model";
import {
    Profile
} from "../../../model/profile/profile.model";
import {
    PlantnetResponse
} from "../../../model/plantnet/plantnet-response.model";
import {
    TelaBotanicaProject
} from "../../../model/occurrence/tela-botanica-project.model";
import {
    OccurrenceFilters
} from "../../../model/occurrence/occurrence-filters.model";
import {
    OccurrencesDataSource
} from "../../../services/occurrence/occurrences.datasource";
import {
    PhotoService
} from "../../../services/photo/photo.service";
import {
    PlantnetService
} from "../../../services/plantnet/plantnet.service";
import {
    ExistInChorodepService
} from "../../../services/chorodep/exist-in-chorodep.service";
import {
    TelaBotanicaProjectService
} from "../../../services/occurrence/tela-botanica-project.service";
import {
    OccurrenceBuilder
} from "../../../utils/occurrence-builder.utils";
import {
    EfloreCardUrlBuilder
} from "../../../utils/eflore-card-url-builder.utils";
import {
    DateFormatter
} from "../../../utils/date-formatter.utils";
import {
    ConfirmDialogComponent
} from "../../../components/occurrence/confirm-dialog/confirm-dialog.component";
import {
    AddPhotoDialogComponent
} from "../../../components/photo/add-photo-dialog/add-photo-dialog.component";
import {
    TagDialogComponent
} from "../../../components/occurrence/tag-dialog/tag-dialog.component";
import {
    OccurrenceLinkPhotoDialogComponent
} from '../occurrence-link-photo-dialog/occurrence-link-photo-dialog.component';
import {
    PlantnetResultDialogComponent
} from '../plantnet-result-dialog/plantnet-result-dialog.component';
import {
    SsoService
} from "../../../services/commons/sso.service";
import {
    DeviceDetectionService
} from "../../../services/commons/device-detection.service";
import {
    BaseComponent
} from '../../generic/base-component/base.component';
import {
    ProfileService
} from "../../../services/profile/profile.service";
import {
    TokenService
} from "../../../services/commons/token.service";
import {
    NavigationService
} from "../../../services/commons/navigation.service";

@Component({
    selector: 'app-occurrence-form',
    templateUrl: './occurrence-form.component.html',
    styleUrls: ['./occurrence-form.component.css', 'material-overide.css'],
})
export class OccurrenceFormComponent implements OnInit {

    // Reference to the photo gallery:
    @ViewChild('photoGallery') photoGallery;

    // -----------------------------------------------------------------
    // CONSTANTS (storing the three different mode names for this form):
    // -----------------------------------------------------------------
    static readonly CREATE_MODE = "create";
    static readonly SINGLE_EDIT_MODE = "single edit";
    static readonly BULK_EDIT_MODE = "multi edit";


    get CREATE_MODE() {
        return OccurrenceFormComponent.CREATE_MODE;
    }

    get SINGLE_EDIT_MODE() {
        return OccurrenceFormComponent.SINGLE_EDIT_MODE;
    }

    get BULK_EDIT_MODE() {
        return OccurrenceFormComponent.BULK_EDIT_MODE;
    }

    private userId;

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
    profile: Profile;

    // The ids of the occurrences to be edited:
    ids = [];
    // The photos which have been uploaded for the current occurrence(s):
    private photos = new Array < Photo >();
    // The LocationModel object as defined by th user
    private location: LocationModel;
    // The RepositoryItemModel (taxon) object as chosen by the user:
    private taxon: RepositoryItemModel;

    private _duplicateMsg = "Vous avez déjà saisi une observation identique dans votre CEL. Merci de vérifier les informations saisies avant de poursuivre."

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
    patchLatLngDec: Array < number > ;

    // -------------
    // FORM OPTIONS:
    // -------------
    // Should the form be cleared after SUBMIT? (create mode only):
    clearFormAfterSubmit = false;
    // Let's default to create mode:
    mode: string = OccurrenceFormComponent.CREATE_MODE;
    // Should the form be reset?
    resetForm: boolean = false;
    // Should the location component be reset?
    resetLocationComponentFlag: boolean = false;
    // Should the upload component be reset?
    _resetPhotoUploadComponentFlag: boolean = false;
    // Should the taxo component be reset?
    resetTaxoComponentFlag: boolean = false;
    formEnabled: boolean = true;
    // Configuration values for Stephane's modules:
    tagObjectId: number = null;
    baseCelApiUrl: string = environment.api.baseUrl;
    tagLibBaseUrl: string = environment.api.tagLibBaseUrl;
    elevationApiProvider: string = environment.elevationApi.provider;
    mapBgTileUrl: string = environment.mapBgTile.baseUrl;
    autoSelectValueIfOnlyOneResult: boolean = false;
    // Should the advanced forms be displayed instead of basic ones:
    displayFullFormLeft = false;
    displayFullFormRight = false;
    maxDate: Date = new Date()
    isMobile = false;

    // ---------------
    // LIST VALUES:
    // ---------------
    isWildList = [{
            "name": "Sauvage",
            "value": true,
            "tooltip": "La plante observée pousse de manière spontanée dans le milieu"
        },
        {
            "name": "Cultivée",
            "value": false,
            "tooltip": "La plante observée est cultivée ou a été plantée"
        }
    ]

    static readonly occurrenceTypeDefault: string = "observation de terrain";
    static readonly publishedLocationDefault: string = "précise";
    static readonly isWildSelectedDefault: boolean = true;

    // ---------------
    // DEFAULT VALUES:
    // ---------------
    // Used to init/reset
    occurrenceTypeSelected: string = OccurrenceFormComponent.occurrenceTypeDefault;
    publishedLocationSelected: string = OccurrenceFormComponent.publishedLocationDefault;
    isWildSelected: boolean = OccurrenceFormComponent.isWildSelectedDefault;
    projectIdSelected: number;

    // List of repositories for the taxon selection module:
    tbRepositoriesConfig = environment.tbTsbLib.tbRepositoriesConfig;
    sendPhotoFlag: boolean = false;
    // Used to enable/diable the "send photos" button:
    private _nbrOfPhotosToBeSent = 0;

    private linkPhotoToOccDialogRef: MatDialogRef < OccurrenceLinkPhotoDialogComponent > ;
    private plantnetResultDialogRef: MatDialogRef < PlantnetResultDialogComponent > ;
    private tagDialogRef: MatDialogRef < TagDialogComponent > ;
    private addPhotoDialogRef: MatDialogRef < AddPhotoDialogComponent > ;
    private subscription: Subscription;

    constructor(
        private dataService: OccurrencesDataSource,
        private photoService: PhotoService,
        private plantnetService: PlantnetService,
        private existInChorodepService: ExistInChorodepService,
        private tbPrjService: TelaBotanicaProjectService,
        protected _deviceDetectionService: DeviceDetectionService,
        protected _navigationService: NavigationService,
        protected _tokenService: TokenService,
        protected _profileService: ProfileService,
        private ssoService: SsoService,
        private dialog: MatDialog,
        private confirmDialog: MatDialog,
        public snackBar: MatSnackBar,
        private route: ActivatedRoute,
        private router: Router,
        @Inject(DOCUMENT) private document: any) {

        this._initResponsive();
    }

    isSendPhotoButtonDisabled(): boolean {
        return !(this._nbrOfPhotosToBeSent > 0)
    }

    getMaxDate() {
        return new Date();
    }

    updateMaxDate() {
        this.maxDate = this.getMaxDate();
    }

    ngOnInit() {

        this.initFormGroup();
        let token = this.ssoService.getToken();
        let decodedToken = this._getDecodedAccessToken(token);
        this.userId = decodedToken.id;
        this.initOccurrencesToEdit();
        this._loadProjects();
        this._loadProfile();

    }

    private _loadProjects() {
        this.tbPrjService.getCollection().subscribe(
            tbProjects => {
                let emptyPrj = new TelaBotanicaProject();
                emptyPrj.name = '';
                emptyPrj.id = null;
                // Let's add an empty project so the user can revert her choice to
                // no project (null) after choosing one:
                tbProjects = [emptyPrj].concat(tbProjects);
                this.projects = tbProjects;
            }
        );
    }

    private _initResponsive() {

        // @responsive: sets isMobile member value
        this._deviceDetectionService.detectDevice().subscribe(result => {
            this.isMobile = result.matches;
        });
    }

    private initFormGroup() {
        this.occurrenceForm = new FormGroup({
            certainty: new FormControl(),
            dateObserved: new FormControl(),
            isPublic: new FormControl(),
            annotation: new FormControl(),
            observer: new FormControl(),
            publishedLocation: new FormControl(
                OccurrenceFormComponent.publishedLocationDefault),
            occurrenceType: new FormControl(
                OccurrenceFormComponent.occurrenceTypeDefault),
            phenology: new FormControl(),
            observerInstitution: new FormControl(),
            projectId: new FormControl(),
            isWild: new FormControl(
                OccurrenceFormComponent.isWildSelectedDefault),
            coef: new FormControl(),
            sampleHerbarium: new FormControl(),
            locationAccuracy: new FormControl(),
            sublocality: new FormControl(),
            environment: new FormControl(),
            station: new FormControl(),
            bibliographySource: new FormControl(),
            identificationAuthor: new FormControl(),
            displayLeftPanelAdvancedField: new FormControl(),
            displayRightPanelAdvancedField: new FormControl(),
        });
    }

    private _loadProfile() {
        let userId = this._tokenService.getUserId();
        this._profileService.findByUserId(userId).subscribe(
            profiles => {
                if (profiles) {
                    this.profile = profiles[0];
                    this.occurrenceForm.
                        controls['displayLeftPanelAdvancedField'].
                        patchValue(this.profile.alwaysDisplayAdvancedFields);
                    this.occurrenceForm.
                        controls['displayRightPanelAdvancedField'].
                        patchValue(this.profile.alwaysDisplayAdvancedFields);

                    if (this.profile.alwaysDisplayAdvancedFields) {
                        this.toggleAdvancedFormRight();
                        this.toggleAdvancedFormLeft();
                    }
                }
            }
        );
    }

    private _getDecodedAccessToken(token: string): any {
        try {
            return jwt_decode(token);
        } catch (Error) {
            return null;
        }
    }

    getTbTagLibMapHeight(): string {
        return this.isMobile ? '60VH' : '40VH';
    }

    getTbTagLibMapWidth(): string {
        return this.isMobile ? '100%' : '100%'
    }

    async retrieveOccurrences(ids) {
        for (let id of ids) {
            let ctOcc = await this.retrieveOccurrence(id);
            this.occurrences.push(ctOcc);
        }
        if (this.occurrences.length > 0) {
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
        return (this.taxon);
    }

    isTagComponentDisplayable() {
        // Only when creating a new occurrence or editing a single occurrence:
        return (!(this.occurrences && this.occurrences.length > 1));
    }

    openConfirmActionDialog(value, stayOnPage) {

        this.disableForm();
        // In create mode: no need for confirmation:
        if (this.mode == OccurrenceFormComponent.CREATE_MODE) {
            this.postOrPatch(value, stayOnPage);
        }
        // In edit mode, ask for confirmation:
        else {

            let dialogConfig = this.buildDialogConfig();
            let confirmQuestion = this.generateConfirmQuestionFromMode();
            dialogConfig.data = confirmQuestion;
            let confirmDialogRef = this.confirmDialog.open(ConfirmDialogComponent, dialogConfig);

            confirmDialogRef
                .afterClosed()
                .subscribe(response => {
                    if (response == true) {
                        this.postOrPatch(value, stayOnPage);
                    } else {
                        this.enableForm();
                    }
                });
        }
    }


    delayTagApiCalls() {
        return (this.mode == OccurrenceFormComponent.CREATE_MODE);
    }

    private generateConfirmQuestionFromMode() {
        let confirmQuestion = '';
        if (this.mode == OccurrenceFormComponent.CREATE_MODE) {
            confirmQuestion = "Enregistrer l'observation ?";
        } else if (this.mode == OccurrenceFormComponent.SINGLE_EDIT_MODE) {
            confirmQuestion = "Modifier l'observation ?";
        } else if (this.mode == OccurrenceFormComponent.BULK_EDIT_MODE) {
            confirmQuestion = "Modifier les observations ?";
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
        this.document.location.href = 'https://www.tela-botanica.org/wikini/AideCarnetEnLigne/wakka.php';
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
            if (strIds !== undefined) {
                // Bulk edit mode:
                let ids = strIds.split(",");
                this.ids = ids;
                if (ids.length > 1) {
                    this.mode = OccurrenceFormComponent.BULK_EDIT_MODE;
                }
                // Single edit mode:
                else {
                    this.tagObjectId = ids[0];
                    this.mode = OccurrenceFormComponent.SINGLE_EDIT_MODE;
                }
                this.retrieveOccurrences(ids);
            } else {
                // Create mode:
                this.mode = OccurrenceFormComponent.CREATE_MODE;
            }

        });
    }


    private prepopulateForm() {

        let occurrence: Occurrence;
        // @todo use the form mode instead:
        // Single edit mode:
        if (this.occurrences.length == 1) {
            occurrence = this.occurrences[0];

            // Initiate the project select input using the right project if needed:
            if (occurrence.project) {
                this.projectIdSelected = occurrence.project.id;
                console.log(this.projectIdSelected);
            }

            // for inputs with default values, we need to set the value explicitely:
            this.occurrenceTypeSelected = occurrence.occurrenceType;
            this.publishedLocationSelected = occurrence.publishedLocation;
            this.isWildSelected = occurrence.isWild;

            //@todo: temporary ugly fix for CST tests, why the hell does the WS return the nbr as string?!!!
            if (typeof occurrence.elevation === "string") {
                occurrence.elevation = Number(occurrence.elevation);
                // for inputs with default values, we need to set the value explicitely:
                this.occurrenceTypeSelected = occurrence.occurrenceType;
                this.publishedLocationSelected = occurrence.publishedLocation;
                this.isWildSelected = occurrence.isWild;
            }

        }
        // Multi edit mode: a composite occurrence is built based on
        // the occurrences to be edited
        else {
            occurrence = this._buildPrepopulateOccurrence();
        }
        this.occurrenceForm.patchValue(occurrence);
        this.prepopulateLocation(occurrence);

        if (occurrence.userSciName != null && occurrence.userSciName != "Valeurs multiples") {
            this.prepopulateTaxoSearchBox(occurrence);
        }

        if (occurrence.geometry != "Valeurs multiples") {
            this.prepopulateGeolocMap(occurrence);
        }

    }

    private prepopulateTaxoSearchBox(occ: Occurrence) {

        // Create a dummy temp taxon so no change events are fired
        // when setting every single property setting.
        let tmpTaxon = {
            occurenceId: occ.id,
            repository: (occ.taxoRepo == null || occ.taxoRepo == 'Autre/inconnu') ? 'otherunknown' : occ.taxoRepo,
            idNomen: occ.userSciNameId,
            name: occ.userSciName,
            author: ''
        }

        // Update the class member reference and, consequently, the search box
        // component:
        this.patchTaxon = tmpTaxon;
    }

    private prepopulateGeolocMap(occ: Occurrence) {
        if (occ.geometry != null) {
            let jsonGeom = JSON.parse(occ.geometry);
            this.patchElevation = occ.elevation;
            this.patchGeometry = [{
                'type': jsonGeom.type,
                'coordinates': jsonGeom.coordinates
            }];
            console.debug(this.patchGeometry);
            this.patchAddress = occ.locality;
            if (jsonGeom.type == 'Point') {
                this.patchLatLngDec = jsonGeom.coordinates;
            }
        }
    }

    private prepopulateLocation(occ: Occurrence) {

console.debug(occ);
        // To cope with an issue of the geoloc module
        let osmIdValue = (occ.osmId != null) ? occ.osmId : -1;

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
            "osmId": Number(osmIdValue),
            "inseeData": null,
            "osmPostcode": Number(occ.osmPostcode),
            "localityConsistency": false,
            "osmPlaceId": occ.osmPlaceId
        };

    }


    private _buildPrepopulateOccurrence() {
        let prepopOcc = new Occurrence();
        let testOcc = this.occurrences[0];
        let forgetAboutMeProperties = ["geometry", "osmId", "localityInseeCode", "locality", "geodatum", "elevation", "isWild", "isPublic", "occurrenceType", "phenology", "publishedLocation", "dateObserved"];

        // Let's loop around the ccurrence properties
        for (var propertyName in testOcc) {
            // If this is an "own property":
            if (testOcc.hasOwnProperty(propertyName)) {
                let areDifferent = false;

                for (let occ of this.occurrences) {
                    if (occ[propertyName] !== testOcc[propertyName]) {
                        areDifferent = true;
                    }
                }
                // If the values of the propery are equal, we want to prepopulate
                // the form field value with it:
                if (!areDifferent) {
                    prepopOcc[propertyName] = testOcc[propertyName];
                } else {
                    if (propertyName == "taxoRepo") {
                        prepopOcc[propertyName] = "Autre/inconnu";
                    } else if ( ! forgetAboutMeProperties.includes(propertyName) ) {
                        prepopOcc[propertyName] = "Valeurs multiples";
                    }
                }
            }
        }
        return prepopOcc;
    }

    isInCreateMode() {
        return (this.mode == OccurrenceFormComponent.CREATE_MODE);
    }

    toggleAdvancedFormLeft() {
        this.displayFullFormLeft = !this.displayFullFormLeft;
    }

    toggleAdvancedFormRight() {
        this.displayFullFormRight = !this.displayFullFormRight;
    }

    toggleClearFormAfterSubmit(event) {
        this.clearFormAfterSubmit = !this.clearFormAfterSubmit;
    }

    openAddPhotoDialog() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = true;
        dialogConfig.hasBackdrop = true;
        this.addPhotoDialogRef = this.dialog.open(AddPhotoDialogComponent, dialogConfig);

        const subUploaded = this.addPhotoDialogRef.componentInstance.onPhotoUploadedEvent.subscribe(photo => {
            this.onPhotoUploaded(photo);
        });
        const subAdd = this.addPhotoDialogRef.componentInstance.onPhotoAddedEvent.subscribe(photo => {
            this.onPhotoAdded(photo);
        });
        const subDelete = this.addPhotoDialogRef.componentInstance.onPhotoDeletedEvent.subscribe(photo => {
            this.onPhotoDeleted(photo);
        });

        this.addPhotoDialogRef
            .afterClosed()
            .subscribe(
                //occ => this.linkToOccurrence(occ)
            );

    }



    onPhotoAdded(photo: FileData) {
        this._nbrOfPhotosToBeSent++;
    }

    onPhotoDeleted(photo: FileData) {
        this._nbrOfPhotosToBeSent--;
    }

    onPhotoUploaded(photo: any) {
        this.photoGallery.addPhoto(photo);
        this.photos.push(photo);
        this.snackBar.open(
            "La photo " + photo.originalName + " a été enregistrée avec succès.",
            'Fermer', {
                duration: 3500
            });
    }


    private _linkPhotosToOccurrence(occurrenceId, stayOnPage: Boolean) {

        if (this.photos.length) {
            const photoIds = this.photos.map(photo => photo.id);
            this.photoService.bulkReplace(photoIds, {
                occurrence: {
                    id: occurrenceId
                }
            }).subscribe(
                data => {
                    this.snackBar.open(
                        "Les photos et l’observation ont été liées avec succès.",
                        "Fermer", {
                            duration: 3500
                        });
                    if (!stayOnPage) {
                        this.navigateToOccurrenceUi();
                    } else {

                        this.resetFormForNewOccurrence();
                    }
                },
                error => this.snackBar.open(
                    'Une erreur est survenue lors de la création du lien entre les photos et l’obseravation. ' + error,
                    'Fermer', {
                        duration: 3500
                    })
            );
        } else {
            if (!stayOnPage) {
                this.navigateToOccurrenceUi();
            }
        }
    }


    onLocationChange(location: LocationModel) {
        this.location = location;
        this.updateLocationAccuracy();


    }

    onTaxonChange(taxon: RepositoryItemModel) {
console.log('8888888888888888888888888');
        console.debug(taxon);
console.log('8888888888888888888888888');
        if (taxon.repository != null && taxon.repository != '' && taxon.name != null) {
            if (taxon.repository != 'otherunknown') {

                if (this.occurrenceForm.controls['certainty'].value == "douteux") {
                    this.snackBar.open(
                        "La valeur de la certitude a été mise à 'certain'.",
                        "Fermer", {
                            duration: 3500
                        })
                }
                this.occurrenceForm.controls['certainty'].patchValue("certain");
            } else {
                if (this.occurrenceForm.controls['certainty'].value !== "à déterminer") {
                    this.snackBar.open(
                        "La valeur de la certitude a été mise à 'à déterminer'.",
                        "Fermer", {
                            duration: 3500
                        })
                }
                this.occurrenceForm.controls['certainty'].patchValue("à déterminer");
            }
        }
        this.taxon = taxon;
    }

    onPostPhotoError(data: any) {
        let msg;

        if (data.error['hydra:description'].includes('is not a valid image')) {
            msg = "Le fichier n'est pas une image valide.";
        } else if (data.error['hydra:description'].includes('with the same name')) {
            msg = "Vous avez déjà téléversé une image avec le même nom. Ce n'est pas permis dans le CEL.";
        } else {
            msg = "Une erreur est survenue.";
        }
        this.snackBar.open(
            msg,
            "Fermer", {
                duration: 3500
            });
    }

    addPhoto(location: RepositoryItemModel) {

    }

    removePhoto(location: RepositoryItemModel) {

    }

    isPublishable() {
        return (
            this.occurrenceForm.controls['certainty'].value != null &&
            this.location != null &&
            this.occurrenceForm.controls['dateObserved'].value !== null);
    }

    onCancel() {
        this.navigateToOccurrenceUi();
    }

    private clearForm() {
        this.occurrenceForm.reset({
            occurrenceType: OccurrenceFormComponent.occurrenceTypeDefault,
            publishedLocation: OccurrenceFormComponent.publishedLocationDefault,
            isWildSelected: OccurrenceFormComponent.isWildSelectedDefault,
            projectId: null
        });
        if (this.photoGallery) {
            this.photoGallery.reset();
            this.photos = new Array < Photo > ();;
        }
        // Ask children components to reset themselves:
        this._resetTbLibComponents();
        this.taxon = null;
        this.location = null;
    }

    private resetFormForNewOccurrence() {
        this.occurrences = [];
        this.ids = [];
        this.photos = new Array< Photo >();
        this._resetTaxoComponent();
        this.taxon = null;
        this._resetPhotoUploadComponent();
        if (this.photoGallery) {
            this.photoGallery.reset();
        }
        this.occurrenceForm.controls['certainty'].setValue('');
        this.occurrenceForm.controls['annotation'].setValue('');
        this.occurrenceForm.controls['bibliographySource'].setValue('');
        this.occurrenceForm.controls['coef'].setValue('');
        this.occurrenceForm.controls['sampleHerbarium'].setValue(false);
        this.occurrenceForm.controls['phenology'].setValue('');
        this.occurrenceForm.controls['identificationAuthor'].setValue('');
        this.occurrenceForm.controls['occurrenceType'].setValue(OccurrenceFormComponent.occurrenceTypeDefault);
        this.occurrenceForm.controls['isPublic'].setValue(false);
        this.occurrenceForm.controls['isWild'].setValue(OccurrenceFormComponent.isWildSelectedDefault);
    }

    // @refactor: Use ViewChild and call some (to be implemented) component
    //            reset methods
    private _resetTbLibComponents() {
        this.resetForm = true;
        setTimeout(() => {
            this.resetForm = false;
        }, 1000);
    }

    private _resetLocationComponent() {
        this.resetLocationComponentFlag = true;
        setTimeout(() => {
            this.resetLocationComponentFlag = false;
        }, 1000);
    }

    private _resetTaxoComponent() {
        this.resetTaxoComponentFlag = true;
        setTimeout(() => {
            this.resetTaxoComponentFlag = false;
        }, 1000);
    }

    private _resetPhotoUploadComponent() {
        this._resetPhotoUploadComponentFlag = true;
        setTimeout(() => {
            this._resetPhotoUploadComponentFlag = false;
        }, 1000);
    }


    private disableForm() {
        this.occurrenceForm.disable();
        this.formEnabled = false;
        if (this.photoGallery) {
            this.photoGallery.disable();
        }
    }

    private enableForm() {
        this.occurrenceForm.enable();
        this.formEnabled = true;
        if (this.photoGallery) {
            this.photoGallery.enable();
        }
    }


    private async preSubmitValidation(): Promise < string[] > {


        let warnings = new Array();
        let dateObserved = this.occurrenceForm.controls['dateObserved'].value;
console.debug(dateObserved);

        // If we've got all the data we need to check existence in chorodep:
        if (this.taxon != null && this.location != null) {
            this.snackBar.open(
                "Validation préalable lancée (recherche de doublons, vérification de présence dans la chorologie départementale).",
                'Fermer', {
                    duration: 3500
                });
            if (this.location.inseeData != null) {
                let frenchDept = this.location.inseeData.code.substr(0, 2);
                let existsInChorodep = await this.existsInChorodep();

                if (existsInChorodep == "0") {
                    let msg = "Attention, le taxon " + this.taxon.name + " n'est pas signalé par la chorologie dans le département " + frenchDept + ". Si vous êtes sûr de votre observation, vous pouvez signaler votre découverte à la liste chorologie à l'adresse : chorologie@tela-botanica.org. ";
                    warnings.push(msg);
                }
            }
            // If we've got all the data we need to check duplicate existence:
            if (dateObserved != null) {

                let trueDate = new Date();
                trueDate.setDate(dateObserved);
                let month = (trueDate.getUTCMonth() + 1).toString();
                let day = trueDate.getUTCDate().toString();
                let year = trueDate.getUTCFullYear().toString();
                let geomAsString = JSON.stringify(this.location.geometry);
                let sciname = this.taxon.name;

                if (typeof this.taxon.author) {
                    sciname = sciname.concat(' ');
                    sciname = sciname.concat(this.taxon.author);
                }

                let duplicateExists = await this.doublonExists(
                    this.userId, day, month, year, sciname,
                    geomAsString, this.location.locality);

                if (duplicateExists) {
                    warnings.push(this._duplicateMsg);
                }
            }
        }

        return warnings;
    }


    private async postOccurrenceAfterWarningConfirmation(occ: Occurrence, stayOnPage: Boolean) {

        let warnings = await this.preSubmitValidation();

        // Translates the taxo repo returned by the tb-tsb-lib component
        // in case no repo has been chosen:
        if ( occ.taxoRepo == 'otherunknown') {
            occ.taxoRepo = 'Autre/inconnu';
        }

        // Warning(s): (duplicate) OR (the species is not known to chorodep):
        if (warnings.length > 0) {
            // Duplicate!
            if (warnings.includes(this._duplicateMsg)) {
                this.snackBar.open(
                    this._duplicateMsg,
                    'Fermer', {
                        duration: 3500
                    });
            }

            // No duplicate but the species is not known to chorodep:
            else {
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
                    .subscribe(response => {
                        if (response == true) {
                            this.postOccurrence(occ, stayOnPage);
                        }
                        else {
                            this.enableForm();
                        }
                    });

            }

        }
        // no duplicate and species known to chorodep:
        else {
            // Let's post the occurrence to the REST service:
            this.postOccurrence(occ, stayOnPage);
        }

    }

    private postOccurrence(occ: Occurrence, stayOnPage: Boolean) {

        this.dataService.post(occ).subscribe(
            result => {
                if (this.photos.length) {
                    this._linkPhotosToOccurrence(result.id, stayOnPage);
                }
                this.snackBar.open(
                    "L'observation vient d'être créée.",
                    'Fermer', {
                        duration: 3500
                    });
                if (!stayOnPage) {
                    this.navigateToOccurrenceUi();
                }

                if (this.clearFormAfterSubmit) {
                    this.clearForm();
                } else {
                    this.resetFormForNewOccurrence();
                }
                this.enableForm();

            },
            error => {
                this.snackBar.open(
                    'Une erreur est survenue. ' + error,
                    'Fermer', {
                        duration: 3500
                    });
            }
        );
    }

    private patchOccurrence(occ: Occurrence, stayOnPage: boolean) {

        if ( occ.taxoRepo == 'otherunknown') {
            occ.taxoRepo = 'Autre/inconnu';
        }

        this.dataService.patch(occ.id, occ).subscribe(
            result => {
                this._linkPhotosToOccurrence(occ.id, stayOnPage);
                this.snackBar.open(
                    "L'observation a bien été modifiée.",
                    'Fermer', {
                        duration: 3500
                    });
                // Useless in this case but quite logical...
                this.enableForm();

                this.resetFormForNewOccurrence();

            },
            error => {
                this.snackBar.open(
                    'Une erreur est survenue. ' + error,
                    'Fermer', {
                        duration: 3500
                    });
            }
        );
    }

    private bulkReplaceOccurrences(
        occurrencesToBePatched: Occurrence[], occ: Occurrence, stayOnPage: Boolean) {

        let ids = occurrencesToBePatched.map(function(occurrence) {
            return occurrence.id;
        });

        this.dataService.bulkReplace(ids, occ).subscribe(
            result => {
                this.snackBar.open(
                    "Les observations ont bien été modifiées.",
                    'Fermer', {
                        duration: 3500
                    });
                if (!stayOnPage) {
                    this.navigateToOccurrenceUi();
                }
            },
            error => {
                this.snackBar.open(
                    'Une erreur est survenue. ' + error,
                    'Fermer', {
                        duration: 3500
                    });
            }
        );
    }



    //@refactor: use newly introduced form 'mode' instead of counting occurrences
    async postOrPatch(occurrenceFormValue, stayOnPage: boolean) {

        let occBuilder = new OccurrenceBuilder(
            occurrenceFormValue,
            this.taxon,
            this.location);
        let occ = await occBuilder.build(true);

        // The component has been instanciated with at least one
        // occurrence. We're in 'update/edit' mode:
        if (this.occurrences.length > 0) {
            // multiple occurrences, let's json-patch replace!
            if (this.occurrences.length > 1) {
                this.bulkReplaceOccurrences(this.occurrences, occ, stayOnPage);
            }
            // single occurrence, let's patch!
            else {
                occ.id = this.occurrences[0].id;
                console.debug(occ);

                this.patchOccurrence(occ, stayOnPage);
            }
        }
        // No occurrences loaded on init, we're in 'create' mode
        else {
            this.postOccurrenceAfterWarningConfirmation(occ, stayOnPage);

            // Let's post to the REST service:
            //this.postOccurrence(occ);
        }
    }


    askPlantNet() {
        const photoUrls = this.photos.map(photo => photo.url);
        const organs = [];
        for (let p of photoUrls) {
            organs.push('leaf');
        }

        this.plantnetService.get(
            photoUrls,
            organs,
            'fr').subscribe(
            resp => {
                console.debug(resp);
                this.autoSelectValueIfOnlyOneResult = true;
                this.openPlantNetDialog(resp);
            },
            error => {
                console.debug(error);
                let message = "";
                if (error.status == 404) {
                    message = "L'espèce n'a pu être déterminée."
                }
                this.snackBar.open(
                    message,
                    'Fermer', {
                        duration: 3500
                    });
            }
        );

    }

    _patchTaxoUsingPlantnetChoice(taxon: RepositoryItemModel) {
        this.patchTaxon = taxon;
        this.autoSelectValueIfOnlyOneResult = false;
    }

    openTagDialog() {

        this.tagDialogRef = this.dialog.open(TagDialogComponent, {
            data: {
                objectId: this.tagObjectId,
                delayTagApiCalls: this.delayTagApiCalls(),
            }
        });
        this.tagDialogRef
            .afterClosed()
            .subscribe(
                tagArrays => {}
            );

    }

    openPlantNetDialog(result: PlantnetResponse) {

        this.plantnetResultDialogRef = this.dialog.open(PlantnetResultDialogComponent, {
            data: result
        });
        this.plantnetResultDialogRef
            .afterClosed()
            .subscribe(
                taxon => {
                    // Taxon suggestion selected, let's fill the tb-tsb-lib component:
                    if (taxon) {
                        this._patchTaxoUsingPlantnetChoice(taxon);
                    }
                    // The close button has been clicked, no taxon suggestion selected:
                    else {
                        // Switch the tb-tsb-lib component to default mode:
                        this.autoSelectValueIfOnlyOneResult = false;
                    }
                }
            );

    }

    onPhotoRejected(photo: Photo) {
        this.snackBar.open(
            "Seuls les fichiers au format JPEG ou PNG peuvent être ajoutés en tant que photo dans le CEL",
            'Fermer', {
                duration: 3500
            });
    }

    onPhotoRemoved(photo: any) {
        let index = this.photos.indexOf(photo);
        if (index > -1) {
            this.photos.splice(index, 1);
        }
    }

    isPlantNetCallable() {
        return (this.photos.length > 0);
    }

    private async existsInChorodep() {

        if (this.taxon != null &&
            this.location != null &&
            this.location.osmCountry != null &&
            this.location.inseeData != null &&
            this.location.inseeData.code != null &&
            this.location.inseeData.code.length >= 2) {

            let taxonId: number;
            let frenchDept = this.location.inseeData.code.substr(0, 2);

            if (typeof this.taxon.idNomen === 'string') {
                taxonId = parseInt(this.taxon.idNomen);
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
        userId: string,
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
        console.debug(filters);
        return this.dataService.findOccurrences(
            null, null, 0, 2, filters).map(
            occurrences => {
                return (occurrences.length > 0);
            }).toPromise();
    }

    private generateSignature(
        userId: string,
        dateObservedDay: string,
        dateObservedMonth: string,
        dateObservedYear: string,
        userSciName: string,
        geometry: string,
        locality: string) {

        let signatureBits = [
            userId, dateObservedMonth,
            dateObservedDay, dateObservedYear,
            userSciName.trim(), geometry, locality
        ];
        let unencodedSignature = '';

        for (let bit of signatureBits) {
            unencodedSignature = unencodedSignature + '-';
            if (bit != undefined) {
                unencodedSignature = unencodedSignature + bit;
            }

        }

        // We must urlencode the because of the "Unicode Problem":
        // https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
        return btoa(encodeURIComponent(unencodedSignature));
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
                photo => {
                    if (photo) {
                        this.photos.push(photo);
                        this.photoGallery.addPhoto(photo);
                    }
                }
            );
    }

    private createPhotos(photos: FileData[]) {

    }

    private createPhoto(photo: FileData) {

    }

    _informUserLocationAccuracyWaAutomaticallyUpdated() {
        this.snackBar.open(
            "La valeur de la précision a été mise à jour.",
            "Fermer", {
                duration: 3500
            });

    }

    updateLocationAccuracy() {
        console.log('_updateLocationAccuracy');
        if (this.location.locationAccuracy == "10 à 100 m") {
            if (this.occurrenceForm.controls['locationAccuracy'].value != "10 à 100 m") {
                this.occurrenceForm.controls['locationAccuracy'].patchValue("10 à 100 m")
                this._informUserLocationAccuracyWaAutomaticallyUpdated();
            }
        } else if (
            this.location.locationAccuracy == 'Localité' &&
            (this.occurrenceForm.controls['sublocality'].value != "" && this.occurrenceForm.controls['sublocality'].value != null)) {

            if (this.occurrenceForm.controls['locationAccuracy'].value != "Lieu-dit") {
                this.occurrenceForm.controls['locationAccuracy'].patchValue("Lieu-dit");
                this._informUserLocationAccuracyWaAutomaticallyUpdated();
            }
        } else if (this.location.locationAccuracy == 'Localité' && (this.occurrenceForm.controls['sublocality'].value == "" || this.occurrenceForm.controls['sublocality'].value == null)) {
            if (this.occurrenceForm.controls['locationAccuracy'].value != "Localité") {

                this.occurrenceForm.controls['locationAccuracy'].patchValue('Localité')
                this._informUserLocationAccuracyWaAutomaticallyUpdated();
            }
        }
    }

    sendPhotos() {
        this.sendPhotoFlag = true;
        setTimeout(() => {
            this.sendPhotoFlag = false;
        }, 100);
    }

}
