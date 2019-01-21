import { TaxoRepo } from "./taxo-repo.model";

export class Occurrence {
    id: number;
    userSciName: string;
    userSciNameId: number;
    coef: number;
    isPublic: boolean; 
    isWild: boolean;
    identiplanteScore: number;
    isIdentiplanteValidated:  boolean;
    dateObserved: string;
    observer: string;
    observerInstitution: string;
    occurrenceType: string;
    certainty: string;
    phenology: string;  
    geometry:  string;
    signature:  string;
    elevation: number;
    locality:  string;
    sublocality:  string;
    geodatum:  string;
    environment:  string;
    localityConsistency:  boolean;
    station:  string;
    publishedLocation:  string;
    locationAccuracy:  string;
    osmCounty:  string;
    osmState:  string;
    osmPostcode:  string;
    osmCountry:  string;
    osmCountryCode:  string;
    osmId:  number;
    osmPlaceId:  number;
    sampleHerbarium: boolean;
    taxoRepo: TaxoRepo;
} 
