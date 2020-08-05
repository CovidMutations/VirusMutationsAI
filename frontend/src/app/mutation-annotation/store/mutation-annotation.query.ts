import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { MutationAnnotationStore, MutationAnnotationState } from './mutation-annotation.store';

@Injectable({
  providedIn: 'root'
})
export class MutationAnnotationQuery extends QueryEntity<MutationAnnotationState> {
  constructor(protected store: MutationAnnotationStore) {
    super(store);
  }
}
