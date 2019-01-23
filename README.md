# Installing the project


## Cloning the project

```
git clone https://gitlab.com/slack_lpm/cel2-client.git
```

## Installing depencies

In the project root folder, launch the npm install:

```
npm install
```


## Editing configuration


The configurations are located in the src/environments folder of the project. Edit the file correponding to your environment by setting the right baseUrl for the CEL api:

### Editing CEL2 API URL

Edit the value of the api.baseUrl JSON element to match your installation.

### Editing PlantNet aPI key

Edit the value of the plantnet.apiKey JSON element to match your key.

## Dev: launching the app on the test server

You can do so by issuing the following command:

```
ng serve
```

## Prod: Building the file in prod mode

```
ng build --prod
```

Note: the --prod build mode is a bit touchier than the "standard" (dev) build...

## Prod: Deploying on server


You can then follow the angular manual depending on the server you want to deploy: https://angular.io/guide/deployment.

