import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';
import { AuthComponent } from './auth/auth.component';
import { RegistrationComponent } from './registration/registration.component';


const routes: Routes = [
  { path: '', component: AuthComponent, pathMatch: 'full'  },
  { path: 'registration', component: RegistrationComponent, pathMatch: 'full'  },
  { path: 'confirm-code-verification/:userId/:code', component: RegistrationComponent, pathMatch: 'full'  }
];


@NgModule({
  declarations: [
    AuthComponent,
    RegistrationComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class AuthModule { }
