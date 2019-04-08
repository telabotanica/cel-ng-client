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
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/occurrence-ui', 
    pathMatch: 'full', 

    canActivate: [AuthGuard] 
  },
  { 
    path: 'occurrence-ui', 
    component: OccurrenceUiComponent, 

    canActivate: [AuthGuard] 
  },
  { 
    path: 'photo-ui', 
    component: PhotoUiComponent, 

    canActivate: [AuthGuard] 
  },
  { 
    path: 'map-ui', 
    component: MapUiComponent, 

    canActivate: [AuthGuard] 
  },
  { 
    path: 'user-profile-ui', 
    component: UserProfileUiComponent, 

    canActivate: [AuthGuard] 
  },
  { 
    path: 'occurrence-detail/:id', 
    component: OccurrenceDetailComponent, 

    canActivate: [AuthGuard] 
  },
  { 
    path: 'photo-detail/:id', 
    component: PhotoDetailComponent, 

    canActivate: [AuthGuard] 
  },
  { 
    path: 'user-agreement', 
    component: UserAgreementComponent, 

    canActivate: [AuthGuard] 
  },
  { 
    path: 'occurrence-form', 
    component: OccurrenceFormComponent, 

    canActivate: [AuthGuard] 
  },
  { 
    path: 'occurrence-collection-edit-form/:ids', 
    component: OccurrenceFormComponent, 

    canActivate: [AuthGuard] 
  },
  { 
    path: 'help', 
    component: HelpComponent,
 
    canActivate: [AuthGuard] 
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
