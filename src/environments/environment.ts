// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  app : {
    title:           'Carnet en ligne DEV',
    unsetTokenValue: 'unset',
    absoluteBaseUrl: 'http://localhost:4200/',
    helpUrl: 'https://www.tela-botanica.org/wikini/AideCarnetEnLigne/wakka.php',
    importTemplateUrl: 'https://resources.tela-botanica.org/modele_import_excel_carnet_en_ligne.xlsx',
  },
  algolia: {
    baseUrl:       'https://yotvbfebjc-dsn.algolia.net/1/indexes/*/queries',
    apiKey:        '843a36372facc0f1836f53d1d5968aa8',
    applicationId: 'YOTVBFEBJC',
  },
  plantnet: {
    baseUrl: 'http://127.0.0.1:8000/api/plantnet'
  },
  api: {
    baseUrl: 'http://127.0.0.1:8000/api',
    tagLibBaseUrl: 'http://127.0.0.1:8000',
    prefix: 'api',
  },
  telaWebSite: {
    profileUrl: 'https://www.tela-botanica.org/membres/me/settings/profile',
    homepageUrl: 'https://www.tela-botanica.org',
    contactUrl: 'https://www.tela-botanica.org/widget:reseau:remarques?lang=fr&service=cel&pageSource=https%3A%2F%2Fwww.tela-botanica.org%2Fappli%3Acel',
  },
  chorodep: {
    baseUrl: 'https://api.tela-botanica.org/service:cel/InventoryTaxonPresent'
  },
  identiplante: {
    baseUrl: 'https://www.tela-botanica.org/appli:identiplante'
  },
  eflore: {
    baseUrlTemplate: 'https://www.tela-botanica.org/${taxoRepoName}-nn-${taxonId}-synthese'
  },
  mapBgTile: {
    baseUrl: 'https://a.tile.openstreetmap.fr/osmfr',
    url: 'https://a.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png'
  },
  elevationApi: {
    provider: 'openElevation',
  },
  sso: {
    identiteEndpoint: 'http://localhost:8080/service:annuaire:auth/identite',
    authWidgetUrl:    'http://localhost:8080/service:annuaire:auth/login?login=your-local-user@email.lol&password=your-password&',
    refreshEndpoint:  'http://localhost:8080/service:annuaire:auth/rafraichir',
    refreshInterval:  600000
  },
  misc: {
    ministereMTESHomepageUrl: 'https://www.ecologique-solidaire.gouv.fr/',
  },
  photoTagLib: {
    basicTags: [
      {category: 'Organes', name: 'Fleur', id: null, userId: null},
      {category: 'Organes', name: 'Feuille', id: null, userId: null},
      {category: 'Organes', name: 'Fruit', id: null, userId: null},
      {category: 'Organes', name: 'Port', id: null, userId: null},
      {category: 'Organes', name: 'Écorce', id: null, userId: null},
      {category: 'Organes', name: 'Rameau', id: null, userId: null},
      {category: 'Organes', name: 'Graine', id: null, userId: null},
      {category: 'Organes', name: 'Bourgeon', id: null, userId: null},
      {category: 'Organes', name: 'Cotylédon', id: null, userId: null},
      {category: 'Organes', name: 'Organe souterrain', id: null, userId: null},
      {category: 'Photo', name: 'Scan', id: null, userId: null},
      {category: 'Photo', name: 'Planche', id: null, userId: null},
      {category: 'Photo', name: 'Dessin', id: null, userId: null},
      {category: 'Morphologie', name: 'Plantule', id: null, userId: null},
      {category: 'Morphologie', name: 'Rosette', id: null, userId: null},
    ]
  },
  tbTsbLib: {
    // List of repositories for the taxon selection module:
    tbRepositoriesConfig : [{
        id: 'bdtfx',
        label: 'Métropole',
        levels: ['idiotaxon'],
        apiUrl: 'https://api.tela-botanica.org/service:cel/NameSearch/bdtfx/',
        apiUrl2: '',
        apiUrlValidOccurence: 'https://api.tela-botanica.org/service:eflore:0.1/bdtfx/noms/',
        description_fr: ''
    }, {
        id: 'bdtfxr',
        label: 'Métropole (index réduit)',
        levels: ['idiotaxon'],
        apiUrl: 'https://api.tela-botanica.org/service:cel/NameSearch/bdtfxr/',
        apiUrl2: '',
        apiUrlValidOccurence: 'https://api.tela-botanica.org/service:eflore:0.1/bdtfxr/noms/',
        description_fr: ''
    }, {
        id: 'bdtxa',
        label: 'Antilles françaises',
        levels: ['idiotaxon'],
        apiUrl: 'https://api.tela-botanica.org/service:cel/NameSearch/bdtxa/',
        apiUrl2: '',
        apiUrlValidOccurence: 'https://api.tela-botanica.org/service:eflore:0.1/nva/noms/',
        description_fr: ''
    }, {
        id: 'bdtre',
        label: 'Réunion',
        levels: ['idiotaxon'],
        apiUrl: 'https://api.tela-botanica.org/service:cel/NameSearch/bdtre/',
        apiUrl2: '',
        apiUrlValidOccurence: 'https://api.tela-botanica.org/service:eflore:0.1/bdtre/noms/',
        description_fr: ''
    }, {
        id: 'florical',
        label: 'Nouvelle-Calédonie',
        levels: ['idiotaxon'],
        apiUrl: 'https://api.tela-botanica.org/service:cel/NameSearch/florical/',
        apiUrl2: '',
        apiUrlValidOccurence: 'https://api.tela-botanica.org/service:eflore:0.1/florical/noms/',
        description_fr: ''
    }, {
        id: 'aublet',
        label: 'Guyane',
        levels: ['idiotaxon'],
        apiUrl: 'https://api.tela-botanica.org/service:cel/NameSearch/aublet/',
        apiUrl2: '',
        apiUrlValidOccurence: 'https://api.tela-botanica.org/service:eflore:0.1/aublet/noms/',
        description_fr: ''
    }, {
        id: 'apd',
        label: 'Afrique tropicale',
        levels: ['idiotaxon'],
        apiUrl: 'https://api.tela-botanica.org/service:cel/NameSearch/apd/',
        apiUrl2: '',
        apiUrlValidOccurence: 'https://api.tela-botanica.org/service:eflore:0.1/apd/noms/',
        description_fr: ''
    }, {
        id: 'isfan',
        label: 'Afrique du Nord',
        levels: ['idiotaxon'],
        apiUrl: 'https://api.tela-botanica.org/service:cel/NameSearch/isfan/',
        apiUrl2: '',
        apiUrlValidOccurence: 'https://api.tela-botanica.org/service:eflore:0.1/isfan/noms/',
        description_fr: ''
    }, {
        id: 'lbf',
        label: 'Liban',
        levels: ['idiotaxon'],
        apiUrl: 'https://api.tela-botanica.org/service:cel/NameSearch/lbf/',
        apiUrl2: '',
        apiUrlValidOccurence: 'https://api.tela-botanica.org/service:eflore:0.1/lbf/noms/',
        description_fr: ''
    }, {
        id: 'taxref',
        label: 'France',
        levels: ['idiotaxon'],
        apiUrl: 'https://api.tela-botanica.org/service:cel/NameSearch/taxref/',
        apiUrl2: '',
        apiUrlValidOccurence: 'https://api.tela-botanica.org/service:eflore:0.1/taxref/noms/',
        description_fr: ''
    }, {
        id: 'taxreflich',
        label: 'Lichens',
        levels: ['idiotaxon'],
        apiUrl: 'https://api.tela-botanica.org/service:cel/NameSearch/taxreflich/',
        apiUrl2: '',
        apiUrlValidOccurence: 'https://api.tela-botanica.org/service:eflore:0.1/taxreflich/noms/',
        description_fr: ''
    }]
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
