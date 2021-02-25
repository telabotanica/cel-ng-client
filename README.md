# Installing the project

## Installing depencies

In the project root folder, launch the npm install:

```
npm install
```


## Editing configuration


The configurations are located in the src/environments folder of the project. Edit the file correponding to your environment by setting the right baseUrl for the CEL api. For prod, the config should be located at <prj_folder>/src/environments/environments.ts. When installing the app, the configuration mainly deals in adapting API URL and auth info (API key, app ID).

### Editing CEL2 API URL

This is the case for the CEL API and plantnet services (which are proxied by a CEL Web service) with the following root entries:

* api
* plantnet

### Editing other tela API URL

That's also the case for tela other API with the following root entries:

* algolia
* chorodep
* identiplante
* eflore
* sso
* mapBgTile

### Editing app.absoluteBaseUrl

Almost done, the app.absoluteBaseUrl entry value should be adapted. 

### Last checks

The following entries shoud not change from one install to another but a quick check could be useful, especially for the following root entries:

* telaWebSite
* app.helpUrl
* app.importTemplateUrl

## Dev: launching the app locally

```
ng s -c local
```

## Prod: Building the file in prod mode

If the app is not located at the root of the app server, please add the corresponding "base-href" parameter (don't forget the ending slash...). For example:

```
ng build --prod --base-href /appli:cel/
```

Note: the --prod build mode is a bit touchier than the "standard" (dev) build...

## Prod: Deploying on server

Use rsync like:
```
rsync -av dist/cel-ng-client/ user@server:/home/user/www/cel-ng/
```

