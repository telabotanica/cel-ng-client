import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OccurrenceUiComponent } from './components/occurrence/occurrence-ui/occurrence-ui.component';
import { PhotoUiComponent } from './components/photo/photo-ui/photo-ui.component';
import { MapUiComponent } from './components/map/map-ui/map-ui.component';
import { UserProfileUiComponent } from './components/user-profile/user-profile-ui/user-profile-ui.component';
import { OccurrenceDetailComponent } from './components/occurrence/occurrence-detail/occurrence-detail.component';
import { OccurrenceFormComponent } from './components/occurrence/occurrence-form/occurrence-form.component';
import { PhotoDetailComponent } from './components/photo/photo-detail/photo-detail.component';
import { UserAgreementComponent } from './components/generic/user-agreement/user-agreement.component';
import { HelpComponent } from './components/generic/help/help.component';

const routes: Routes = [
    { path: '', redirectTo: '/occurrence-ui', pathMatch: 'full' },
    { path: 'occurrence-ui', component: OccurrenceUiComponent },
    { path: 'photo-ui', component: PhotoUiComponent },
    { path: 'map-ui', component: MapUiComponent },
    { path: 'user-profile-ui', component: UserProfileUiComponent },
    { path: 'occurrence-detail/:id', component: OccurrenceDetailComponent },
    { path: 'photo-detail/:id', component: PhotoDetailComponent },
    { path: 'user-agreement', component: UserAgreementComponent },
    { path: 'occurrence-form', component: OccurrenceFormComponent },
    { path: 'occurrence-collection-edit-form/:ids', component: OccurrenceFormComponent },
    { path: 'help', component: HelpComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
