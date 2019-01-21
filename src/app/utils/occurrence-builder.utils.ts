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

  build() {
    let occ = new Occurrence();
    if ( this.taxon != null ) {
        occ = this.fillOccTaxoProperties(occ);  
    }
    if ( this.location != null ) {
        occ = this.fillOccLocationProperties(occ);  
    }
    occ = this.fillOccProperties(occ);

    return occ;
  }

  private fillOccPropertyWithValue(occ: Occurrence, propName: string, propValue: string): Occurrence {
    if (propValue !== "" && propValue !== null) {   
      occ[propName] = propValue;
    } 

    return occ;
  }

  private fillOccLocationProperties(occ: Occurrence): Occurrence {
    let props = ["elevation", "localityConsistency", 
      "locationAccuracy", "osmCountry", "osmCountryCode", "osmId",
      "osmState", "publishedLocation", "station", "sublocality"];
    for (let propName of props) {
      occ = this.fillOccPropertyWithValue(
        occ, propName, this.location[propName]);
    }
    if (this.location.geometry != null) {
        occ.geometry = JSON.stringify(this.location.geometry);
    }
    if (this.location.osmId != null) {
        occ.osmId = this.location.osmId;
    }
    return occ;   
  }

  private fillOccTaxoProperties(occ: Occurrence): Occurrence {
    occ.userSciName   = this.taxon.name;

    // ? idNomen ?
    // Cast pblm because taxon.idTaxo; string|  number...
//    occ.userSciNameId = this.taxon.idTaxo;
    let repository = this.getRepositoryByName(this.taxon.repository);
    occ.taxoRepo.id = repository.id;

    return occ; 
  }

  private getRepositoryByName(name: string): TaxoRepo {

    this.taxoRepoService.getCollection().map(taxoRepos => {
        for (let taxoRepo of taxoRepos) {
            if (taxoRepo.name == name ) {
                return taxoRepo;
            }
        }
      });

    return null; 
  }

  private fillOccProperties(occ: Occurrence): Occurrence {
    let props = ["certainty", "observer", "occurrenceType", 
      "certainty", "phenology", "geodatum", "environment",
      "isWild", "isPublic", "station", "coef", "station",
      "sampleHerbarium"];

    for (let propName of props) {
      occ = this.fillOccPropertyWithValue(
        occ, propName, this.formValue[propName]);
    }

    return occ;  
  }



}
