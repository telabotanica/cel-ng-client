export class OccurrenceFilters {

  dateObservedDay: number;
  dateObservedMonth: number;
  dateObservedYear: number;
  family: string;
  frenchDep: string;
  userSciName: string;
  locality: string;
  signature:  string;
  osmCountry: string;
  isIdentiplanteValidated: boolean;
  isPublic: boolean;
  certainty: string;
  projectId: number;
  freeTextQuery: string;
  tags: Array<string>;
  ids: Array<string>;



//interface UrlParameterGenerator

  toUrlParameters() : string  {
    let urlParams = '';
    for (var propertyName in this) {
      if (this.hasOwnProperty(propertyName) && ! (this[propertyName] == null)) {
        urlParams += '&';
        urlParams += propertyName;
        urlParams += '=';
        urlParams += this[propertyName].toString();
      }
    }

    return urlParams.substring(1);
  }

} 
