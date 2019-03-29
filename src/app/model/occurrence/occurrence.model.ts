import { TelaBotanicaProject } from "./tela-botanica-project.model";

/**
 * Models a botanical occurrence.
 */
// @todo use enum when appropriate
export class Occurrence {
  id:                       number;
  userSciName:              string;
  userSciNameId:            number;
  coef:                     number;
  isPublic:                 boolean; 
  isWild:                   boolean;
  identiplanteScore:        number;
  isIdentiplanteValidated:  boolean;
  dateObserved:             string;
  observer:                 string;
  observerInstitution:      string;
  occurrenceType:           string;
  certainty:                string;
  phenology:                string;  
  geometry:                 string;
  signature:                string;
  elevation:                number;
  locality:                 string;
  localityInseeCode:        string;
  sublocality:              string;
  geodatum:                 string;
  bibliographySource:       string;
  environment:              string;
  localityConsistency:      boolean;
  station:                  string;
  publishedLocation:        'précise' | 'localité' | '10x10km';
  locationAccuracy:         string;
  osmCounty:                string;
  osmState:                 string;
  osmPostcode:              string;
  osmCountry:               string;
  osmCountryCode:           string;
  osmId:                    string;
  osmPlaceId:               number;
  sampleHerbarium:          boolean;
  project:                  TelaBotanicaProject;
  taxoRepo:                 string;




} 
