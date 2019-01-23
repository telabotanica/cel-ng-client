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

git clone 

## Dev: launching the app on the test server

You can do so by issuing the following comand:

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

