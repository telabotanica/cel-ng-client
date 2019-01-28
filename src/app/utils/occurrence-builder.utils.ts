import { LocationModel } from "tb-geoloc-lib/lib/_models/location.model";
import { RepositoryItemModel } from "tb-tsb-lib/lib/_models/repository-item.model";
import { Occurrence } from "../model/occurrence/occurrence.model";
import { TaxoRepo } from "../model/occurrence/taxo-repo.model";
import { TaxonomicRepositoryService } from "../services/occurrence/taxonomic-repository.service";

export class OccurrenceBuilder {  
  
  private taxon: RepositoryItemModel;
  private location: LocationModel;
  private formValue;
  private taxoRepoService: TaxonomicRepositoryService;
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
    location: LocationModel,
    taxoRepoService: TaxonomicRepositoryService) {

    this.taxon = taxon;
    this.location = location;
    this.formValue = formValue;
    this.taxoRepoService = taxoRepoService;
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
    let props = ["elevation", "localityConsistency", 
      "locationAccuracy", "osmCountry", "osmCountryCode", "osmId",
      "osmState", "publishedLocation", "station", "sublocality"];

    for (let propName of props) {
      this.fillOccPropertyWithValue(
        propName, this.location[propName]);
    }

    if (this.location.geometry != null) {
        this.occ.geometry = JSON.stringify(this.location.geometry);
    }
    if (this.location.osmId != null) {
        this.occ.osmId = this.location.osmId;
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
    this.occ.userSciNameId = parseInt(this.taxon.idNomen);
    let taxoRepos = await this.taxoRepoService.getCollection().toPromise();
    let occTaxoRepo = null;

    // Pick the TaxoRepo with selected name:
    for (let taxoRepo of taxoRepos) {
      if (taxoRepo.name == this.taxon.repository ) {
          occTaxoRepo = taxoRepo;
      }
    }

    if (occTaxoRepo != undefined) {
      this.occ.taxoRepo = occTaxoRepo;
    }

  }

  private fillOccProperties(): void {
    let props = ["certainty", "observer", "occurrenceType", 
      "certainty", "phenology", "geodatum", "environment",
      "isWild", "isPublic", "station", "coef", "station",
      "sampleHerbarium", "observerInstitution"];

    for (let propName of props) {
      this.fillOccPropertyWithValue(
        propName, this.formValue[propName]);
    }

  }


}
