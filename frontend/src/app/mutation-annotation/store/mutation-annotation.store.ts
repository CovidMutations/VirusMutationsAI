import { Injectable } from '@angular/core';
import {  EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import {  MutationAnnotationModel } from '../../models/mutation-annotation.model';


export interface MutationAnnotationState extends EntityState<MutationAnnotationModel, number> { }

@Injectable({
  providedIn: 'root',
})
@StoreConfig({ name: 'MutationAnnotation' })
export class  MutationAnnotationStore extends EntityStore<MutationAnnotationState> {

  constructor() {
    super({
      loading: false
    });
  }
}

