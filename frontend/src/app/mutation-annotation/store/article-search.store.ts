import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { MutationAnnotationArticleModel } from '../../models/mutation-annotation.model';

export interface ArticleSearchState {
  articles?: MutationAnnotationArticleModel[];
  query?: string;
}

function createInitialState(): ArticleSearchState {
  return { };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'ArticleSearch' })
export class ArticleSearchStore extends Store<ArticleSearchState> {
  constructor() {
    super(createInitialState());
  }
}
