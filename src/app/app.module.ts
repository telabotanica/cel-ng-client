import { APP_INITIALIZER } from '@angular/core';
import { AppConfig } from './app.config';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http'; 
import { OverlayModule } from '@angular/cdk/overlay';
import { ScrollDispatchModule } from '@angular/cdk/scrolling';

import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './material.module';
import { SharedModule } from './shared.module';

import { JsonPatchService } from '../restit/services/json-patch.service';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/generic/header/header.component';
import { OccurrenceGridComponent } from './components/occurrence/occurrence-grid/occurrence-grid.component';
import { OccurrenceFormComponent } from './components/occurrence/occurrence-form/occurrence-form.component';
import { OccurrenceDetailComponent } from './components/occurrence/occurrence-detail/occurrence-detail.component';
import { PhotoGalleryComponent } from './components/photo/photo-gallery/photo-gallery.component';
import { PhotoDetailComponent } from './components/photo/photo-detail/photo-detail.component';
import { PhotoFiltersComponent } from './components/photo/photo-filters/photo-filters.component';
import { OccurrenceFiltersComponent } from './components/occurrence/occurrence-filters/occurrence-filters.component';
import { OccurrenceUiComponent } from './components/occurrence/occurrence-ui/occurrence-ui.component';
import { PhotoUiComponent } from './components/photo/photo-ui/photo-ui.component';
import { UserOccurrenceTagTreeComponent } from "./components/occurrence/user-occurrence-tag-tree/user-occurrence-tag-tree.component";
import { MapUiComponent } from './components/map/map-ui/map-ui.component';
import { UserProfileUiComponent } from './components/user-profile/user-profile-ui/user-profile-ui.component';
import { BurgerMenuComponent } from './components/generic/burger-menu/burger-menu.component';
import { OccurrenceMapComponent } from './components/map/occurrence-map/occurrence-map.component';
import { ImportDialogComponent } from './components/occurrence/import-dialog/import-dialog.component';
import { OccurrencesDataSource } from "./services/occurrence/occurrences.datasource";
import { PhotoService } from "./services/photo/photo.service";
import { TelaBotanicaProjectService } from "./services/occurrence/tela-botanica-project.service";
import { UserOccurrenceTagService } from "./services/occurrence/user-occurrence-tag.service";
import { EfloreService } from "./services/eflore/eflore.service";
import { AlgoliaEfloreParserService } from "./services/eflore/algolia-eflore-parser.service";
import { PlantnetService } from "./services/plantnet/plantnet.service";
import { ExistInChorodepService } from "./services/chorodep/exist-in-chorodep.service";
import { PhotoShareDialogComponent } from './components/photo/photo-share-dialog/photo-share-dialog.component';
import { PhotoLinkOccurrenceDialogComponent } from './components/photo/photo-link-occurrence-dialog/photo-link-occurrence-dialog.component';
import { PhotoDisplayDialogComponent } from './components/photo/photo-display-dialog/photo-display-dialog.component';
import { TbGeolocLibModule } from 'tb-geoloc-lib';
import { TbDropfileLibModule } from 'tb-dropfile-lib';
import { TbTsbLibModule } from 'tb-tsb-lib';
import { TaxonomicRepositoryService } from './services/occurrence/taxonomic-repository.service';
import { UserAgreementComponent } from './components/generic/user-agreement/user-agreement.component';
import { HelpComponent } from './components/generic/help/help.component'

// Loading the app config file from assets
/*
export function initializeApp(appConfig: AppConfig) {
  return () => appConfig.load();
}
*/
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    OccurrenceGridComponent,
    OccurrenceFormComponent,
    OccurrenceDetailComponent,
    OccurrenceFiltersComponent,
    OccurrenceUiComponent,
    PhotoGalleryComponent,
    PhotoDetailComponent,
    PhotoFiltersComponent,
    PhotoUiComponent,
    UserOccurrenceTagTreeComponent,
    MapUiComponent,
    UserProfileUiComponent,
    BurgerMenuComponent,
    OccurrenceMapComponent,
    ImportDialogComponent,
    PhotoShareDialogComponent,
    PhotoLinkOccurrenceDialogComponent,
    PhotoDisplayDialogComponent,
    UserAgreementComponent,
    HelpComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    SharedModule,
    FlexLayoutModule,
    HttpClientModule,
    OverlayModule,
    TbGeolocLibModule,
    TbDropfileLibModule, 
    TbTsbLibModule,
  ],
  providers: [
    OccurrencesDataSource, 
    PhotoService, 
    TelaBotanicaProjectService, 
    UserOccurrenceTagService,
    JsonPatchService,
    EfloreService,
    AlgoliaEfloreParserService,
    TaxonomicRepositoryService,
    PlantnetService,
    ExistInChorodepService,
/*
    AppConfig,
      { provide: APP_INITIALIZER,
        useFactory: initializeApp,
        deps: [AppConfig], multi: true }
*/
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    BurgerMenuComponent, 
    ImportDialogComponent, 
    PhotoShareDialogComponent,
    PhotoLinkOccurrenceDialogComponent,
    PhotoDisplayDialogComponent]
})
export class AppModule { }
