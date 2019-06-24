// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  app : {
    title:           "Carnet en ligne V2",
    unsetTokenValue: "unset",
    absoluteBaseUrl: "https://beta.tela-botanica.org/cel2-dev/cel2-client/dist/cel2-client",
    helpUrl: "https://www.tela-botanica.org/wikini/AideCarnetEnLigne/wakka.php",
    importTemplateUrl: 'http://perdu.com',
  },
  algolia: {
    baseUrl:       "https://yotvbfebjc-dsn.algolia.net/1/indexes/*/queries",
    apiKey:        "843a36372facc0f1836f53d1d5968aa8",
    applicationId: "YOTVBFEBJC",
  },
  api: {
    baseUrl: "https://beta.tela-botanica.org/cel2-dev/cel2-services/public/api",
    tagLibBaseUrl: "https://beta.tela-botanica.org/cel2-dev/cel2-services/public",
    prefix: "api",
  },
  telaWebSite: {
    profileUrl: 'https://www.tela-botanica.org/membres/me/settings/profile',
    homepageUrl: 'https://www.tela-botanica.org',
    contactUrl: 'https://www.tela-botanica.org/widget:reseau:remarques?lang=fr&service=cel&pageSource=https%3A%2F%2Fwww.tela-botanica.org%2Fcel%2Fappli%2Fcel2.html',
  },
  taxoApi: {
    validationBaseUrl: "https://api.tela-botanica.org/service:eflore:0.1",
    nameSearchBaseUrl: "https://api.tela-botanica.org/service:cel/NameSearch/"
  },
  plantnet: {
    baseUrl: "https://my-api.plantnet.org/v1/identify/all",
    apiKey:  "2a10O8sbWystFClXLBjAJl6x0O"
  },
  chorodep: {
    baseUrl: "https://api.tela-botanica.org/service:cel/InventoryTaxonPresent"
  },
  identiplante: {
    baseUrl: "https://www.tela-botanica.org/appli:identiplante"
  },
  eflore: {
    baseUrlTemplate: "https://www.tela-botanica.org/${taxoRepoName}-nn-${taxonId}-synthese"
  },
  mapBgTile: {
    baseUrl: 'https://osm.tela-botanica.org/tuiles/osmfr',
    url: 'https://osm.tela-botanica.org/tuiles/osmfr/{z}/{x}/{y}.png'
  },
  elevationApi: {
    provider: 'elevationApiIo'
  },
  sso: {
    identiteEndpoint: 'https://beta.tela-botanica.org/service:annuaire:auth/identite',
    authWidgetUrl:    'http://beta.tela-botanica.org/widget:reseau:auth',
    refreshEndpoint:  'https://beta.tela-botanica.org/service:annuaire:auth/rafraichir',
    refreshInterval:  600000
  },
  misc: {
    ministereMTESHomepageUrl: "https://www.ecologique-solidaire.gouv.fr/",
  },
  photoTagLib: {
    basicTags: [
      {path: 'Organes', name: 'Fleur', id: null, userId: null},
      {path: 'Organes', name: 'Feuille', id: null, userId: null},
      {path: 'Organes', name: 'Fruit', id: null, userId: null},
      {path: 'Organes', name: 'Port', id: null, userId: null},
      {path: 'Organes', name: 'Écorce', id: null, userId: null},
      {path: 'Organes', name: 'Rameau', id: null, userId: null},
      {path: 'Organes', name: 'Graine', id: null, userId: null},
      {path: 'Organes', name: 'Bourgeon', id: null, userId: null},
      {path: 'Organes', name: 'Cotylédon', id: null, userId: null},
      {path: 'Organes', name: 'Organe souterrain', id: null, userId: null},
      {path: 'Photo', name: 'Scan', id: null, userId: null},
      {path: 'Photo', name: 'Planche', id: null, userId: null},
      {path: 'Photo', name: 'Dessin', id: null, userId: null},
      {path: 'Morphologie', name: 'Plantule', id: null, userId: null},
      {path: 'Morphologie', name: 'Rosette', id: null, userId: null},
    ]
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
