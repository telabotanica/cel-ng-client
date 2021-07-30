export class PhotoFilters {

    dateShotDay: number;
    dateShotMonth: number;
    dateShotYear: number;
    family: string;
    frenchDep: string;
    osmCountry: string;
    userSciName: string;
    locality: string;
    isIdentiplanteValidated: boolean;
    isPublic: boolean;
    certainty: string;
    projectId: number;
    freeTextQuery: string;
    tags: Array<string>;



// interface UrlParameterGenerator

    toUrlParameters(): string  {
        const urlParams = '';

        for (const propertyName in this) {
            if (this.hasOwnProperty(propertyName)) {
//                if ( !(this[propertyName] instanceof Array<string>) ) {
                    console.log(this[propertyName]);
                    urlParams.concat('&');
                    urlParams.concat(propertyName);
                    urlParams.concat('=');
                    urlParams.concat(this[propertyName].toString());
 //               }
            }
        }

        return urlParams;
    }

}
