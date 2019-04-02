export const environment = {
  production: true,
  algolia: {
      baseUrl:       "https://yotvbfebjc-dsn.algolia.net/1/indexes/*/queries",
      apiKey:        "843a36372facc0f1836f53d1d5968aa8",
      applicationId: "YOTVBFEBJC",
   },
  api: {
      baseUrl: "https://beta.tela-botanica.org/cel2-dev/cel2-services/public/api"
   },
  taxoApi: {
      validationBaseUrl: "https://api.tela-botanica.org/service:eflore:0.1",
      nameSearchBaseUrl: "https://api.tela-botanica.org/service:cel/NameSearch"
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
      baseUrl: 'https://osm.tela-botanica.org/tuiles/osmfr',
      url: 'https://osm.tela-botanica.org/tuiles/osmfr/{z}/{x}/{y}.png'
   },
  elevationApi: {
      provider: 'elevationApiIo'
   },
  ssoAnnuaire: {
      identiteUrl:     'https://beta.tela-botanica.org/service:annuaire:auth/identite',
      authWidgetUrl:   'http://beta.tela-botanica.org/widget:reseau:auth',
      refreshTokenUrl: 'https://beta.tela-botanica.org/service:annuaire:auth/rafraichir',
      refreshInterval: 600000
   }
};
