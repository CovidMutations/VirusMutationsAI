import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

import { Routes, RouterModule } from '@angular/router';

import { MutationAnnotationComponent } from './mutation-annotation/mutation-annotation.component';

const routes: Routes = [
  { path: '', component: MutationAnnotationComponent, pathMatch: 'full'  }
];


@NgModule({
  declarations: [MutationAnnotationComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class MutationAnnotationModule {
}
