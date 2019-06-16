import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { OverlayModule } from '@angular/cdk/overlay';
import { ScrollDispatchModule } from '@angular/cdk/scrolling';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './material.module';
import { MAT_DATE_LOCALE } from '@angular/material';
import { MatPaginatorIntl } from '@angular/material';
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
import { PhotoTagTreeComponent } from "./components/photo/photo-tag-tree/photo-tag-tree.component";
import { MapUiComponent } from './components/map/map-ui/map-ui.component';
import { UserProfileUiComponent } from './components/user-profile/user-profile-ui/user-profile-ui.component';
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
import { OccurrenceLinkPhotoDialogComponent } from './components/occurrence/occurrence-link-photo-dialog/occurrence-link-photo-dialog.component';
import { PhotoDisplayDialogComponent } from './components/photo/photo-display-dialog/photo-display-dialog.component';
import { PlantnetResultDialogComponent } from './components/occurrence/plantnet-result-dialog/plantnet-result-dialog.component';
import { OccurrencePhotoGalleryComponent } from './components/occurrence/occurrence-photo-gallery/occurrence-photo-gallery.component';
import { TbGeolocLibModule } from 'tb-geoloc-lib';
import { TbDropfileLibModule } from 'tb-dropfile-lib';
import { TbTsbLibModule } from 'tb-tsb-lib';
import { TbTagLibModule } from 'tb-tag-lib';
import { UserAgreementComponent } from './components/generic/user-agreement/user-agreement.component';
import { HelpComponent } from './components/generic/help/help.component';
import { ConfirmDialogComponent } from './components/occurrence/confirm-dialog/confirm-dialog.component';
import { HttpErrorInterceptor } from './interceptors/http-error.interceptor';
import { NotificationService } from "./services/commons/notification.service";
import { SsoService } from "./services/commons/sso.service";
import { DeviceDetectionService } from "./services/commons/device-detection.service";
import { MatPaginatorI18nService } from "./services/commons/mat-paginator-i18n.service";
import { AuthInterceptor } from "./interceptors/auth.interceptor";

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

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
    PhotoTagTreeComponent,
    PhotoUiComponent,
    UserOccurrenceTagTreeComponent,
    MapUiComponent,
    UserProfileUiComponent,
    OccurrenceMapComponent,
    ImportDialogComponent,
    PhotoShareDialogComponent,
    PhotoLinkOccurrenceDialogComponent,
    OccurrenceLinkPhotoDialogComponent,
    PlantnetResultDialogComponent,
    OccurrencePhotoGalleryComponent,
    PhotoDisplayDialogComponent,
    UserAgreementComponent,
    HelpComponent,
    ConfirmDialogComponent,
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
    TbTagLibModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, 
      useValue: 'fr-FR' },
//    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, 
      useClass: AuthInterceptor, 
      multi: true },
    {
      provide: MatPaginatorIntl,
      useClass: MatPaginatorI18nService },
    OccurrencesDataSource, 
    PhotoService, 
    TelaBotanicaProjectService, 
    UserOccurrenceTagService,
    NotificationService,
    JsonPatchService,
    EfloreService,
    AlgoliaEfloreParserService,
    PlantnetService,
    ExistInChorodepService,
    TranslateService,
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ConfirmDialogComponent,
    ImportDialogComponent, 
    PhotoShareDialogComponent,
    PhotoLinkOccurrenceDialogComponent,
    OccurrenceLinkPhotoDialogComponent,
    PlantnetResultDialogComponent,
    PhotoDisplayDialogComponent]
})

export class AppModule { }
