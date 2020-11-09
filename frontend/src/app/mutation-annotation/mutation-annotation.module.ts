import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

import { Routes, RouterModule } from '@angular/router';

import { MutationAnnotationComponent } from './mutation-annotation/mutation-annotation.component';
import { MaMenuComponent } from './ma-menu/ma-menu.component';
import { SearchByMutationComponent } from './search-by-mutation/search-by-mutation.component';
import { AnnotationListComponent } from './annotation-list/annotation-list.component';

const routes: Routes = [
  { path: '', component: MaMenuComponent,
  children: [
    { path: 'searchbymutation', component: SearchByMutationComponent  },
    { path: 'searchbyfile', component: MutationAnnotationComponent },
  ]
  }
];


@NgModule({
  declarations: [
    MutationAnnotationComponent,
    MaMenuComponent,
    SearchByMutationComponent,
    AnnotationListComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class MutationAnnotationModule {
}
