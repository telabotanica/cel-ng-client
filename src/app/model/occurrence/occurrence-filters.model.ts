export class OccurrenceFilters { // interface UrlParameterGenerator

  dateObservedDay:          number;
  dateObservedMonth:        number;
  dateObservedYear:         number;
  family:                   string;
  frenchDep:                string;
  userSciName:              string;
  authorEmail:              string;
  locality:                 string;
  signature:                string;
  osmCountry:               string;
  isIdentiplanteValidated:  boolean;
  isPublic:                 boolean;
  certainty:                string;
  projectId:                number;
  freeTextQuery:            string;
  tags:                     Array<string>;
  ids:                      Array<number>;

  toUrlParameters(): string  {
    let urlParams = '';
    for (const propertyName in this) {

      // Array type parameters
      if (Array.isArray(this[propertyName])) {
        for (const idx in this[propertyName]) {
        urlParams += '&';
        urlParams += propertyName;
        urlParams += '[]=';
        urlParams += this[propertyName][idx].toString();
        }
      } else if (this.hasOwnProperty(propertyName) && ! (this[propertyName] == null) ) {
        urlParams += '&';
        urlParams += propertyName;
        urlParams += '=';
        urlParams += this[propertyName].toString();
      }

    }

    // Removes the first '&' and returns:
    return urlParams.substring(1);
  }

}
