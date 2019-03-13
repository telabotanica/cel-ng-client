// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  algolia: {
      baseUrl:       "https://yotvbfebjc-dsn.algolia.net/1/indexes/*/queries",
      apiKey:        "843a36372facc0f1836f53d1d5968aa8",
      applicationId: "YOTVBFEBJC",
   },
  api: {
      baseUrl: "http://localhost:8080/api"
   },
  plantnet: {
      baseUrl: "https://my-api.plantnet.org/v1/identify/all",
      apiKey:  "2a10O8sbWystFClXLBjAJl6x0O"
   },
  chorodep: {
      baseUrl: "https://api.tela-botanica.org/service:cel/InventoryTaxonPresent"
   },
  eflore: {
      baseUrlTemplate: "https://www.tela-botanica.org/${taxoRepoName}-nn-${taxonId}-synthese"
   },
  mapBgTile: {
      url: 'http://tile.osm.org/{z}/{x}/{y}.png'
   }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
