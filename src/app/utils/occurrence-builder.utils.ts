import { LocationModel } from "tb-geoloc-lib/lib/_models/location.model";
import { RepositoryItemModel } from "tb-tsb-lib/lib/_models/repository-item.model";
import { Occurrence } from "../model/occurrence/occurrence.model";
import { TelaBotanicaProject } from "../model/occurrence/tela-botanica-project.model";
import { DateFormatter } from "./date-formatter.utils";

export class OccurrenceBuilder {  
  
  private taxon: RepositoryItemModel;
  private location: LocationModel;
  private formValue;
  // The occurrence being built:
  private occ: Occurrence;

  /**
   * Returns an <code>OccurrenceBuilder</code> instance.
   *
   * @parameter 
   */
  constructor(
    formValue, 
    taxon: RepositoryItemModel, 
    location: LocationModel) {

    this.taxon = taxon;
    this.location = location;
    this.formValue = formValue;
  }

  /**
   * Returns an <code>Occurrence</code> which members have been populated
   * with the models and value provided in the constructor.
   */
  async build(): Promise<Occurrence>  {
    this.occ = new Occurrence();

    if ( this.taxon != null ) {
        await this.fillOccTaxoProperties();  
    }

    if ( this.location != null ) {
        this.fillOccLocationProperties();  
    }

    this.fillOccProperties();

    if ( this.formValue['projectId'] ) {
        this.occ.project = '/api/tela_botanica_projects/' + this.formValue['projectId'];
    }
    else {
        this.occ.project = null;
    }
    return this.occ;
  }

  /**
   * Returns passed <code>Occurrence</code> with its property named propName  
   * set to given propValue.
   */
  private fillOccPropertyWithValue(propName: string, propValue: string): void {
    if (propValue !== "" && propValue !== null) {   
      this.occ[propName] = propValue;
    } 
  }

  private fillOccLocationProperties(): void {
    let props = ["localityConsistency", 
      "locationAccuracy", "osmCountry", "osmCountryCode", "osmId",
      "osmState", "publishedLocation", "station"];

    console.debug(this.location);

    for (let propName of props) {
      this.fillOccPropertyWithValue(
        propName, this.location[propName]);
    }
  
    if (this.location.elevation != null) {
      //@todo should be done in Stéphane's component
      // Let's round double, int are expected
      this.occ.elevation = Number(this.location.elevation.toFixed());
    }
    if (this.location.geometry != null) {
        this.occ.geometry = JSON.stringify(this.location.geometry);
    }
    if (this.location.osmId != null) {
        this.occ.osmId = String(this.location.osmId);
    }
    if (this.location.locality != null) {
        this.occ.locality = this.location.locality;
    }
    if (this.location.inseeData != null && this.location.inseeData.code) {
        this.occ.localityInseeCode = this.location.inseeData.code;
    }  
  }

  private async fillOccTaxoProperties() {
    this.occ.userSciName = this.taxon.name;    

     
    if ( this.taxon.author ) {
        this.occ.userSciName = this.occ.userSciName.concat(' ');
        this.occ.userSciName = this.occ.userSciName.concat(this.taxon.author);
    }
     
    if (typeof this.taxon.idNomen === 'string') {
        this.occ.userSciNameId = parseInt(this.taxon.idNomen);
    } else {
        this.occ.userSciNameId = this.taxon.idNomen;
    }
    if (this.taxon.repository != undefined) {
      this.occ.taxoRepo = this.taxon.repository;
    }

  }

  private fillOccProperties(): void {
    let props = ["certainty", "observer", "occurrenceType", "sampleHerbarium",
      "certainty", "phenology", "geodatum", "environment", "annotation",
      "isWild", "isPublic", "station", "coef", "station", "bibliographySource",
      "publishedLocation", "observerInstitution", "coef", "sublocality",
      "identificationAuthor", "locationAccuracy"];

    for (let propName of props) {
      this.fillOccPropertyWithValue(
        propName, this.formValue[propName]);
    }
    let date = this.formValue['dateObserved'];

    // JSON Stringifying date is based on GWT so we get yesterday. Thus we have
    // to format it by ourself
    // https://stackoverflow.com/questions/44744476/angular-material-datepicker-date-becomes-one-day-before-selected-date 
    if (date) {
      let dateObs =  DateFormatter.format(date);
      this.fillOccPropertyWithValue('dateObserved', dateObs);
    }

    if ( this.formValue[''] != null ) {
        this.fillOccLocationProperties();  
    }


  }


}
