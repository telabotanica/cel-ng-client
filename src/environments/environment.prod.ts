export const environment = {
  production: true,
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
   }
};
