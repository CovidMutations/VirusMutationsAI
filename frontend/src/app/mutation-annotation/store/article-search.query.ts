import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { Observable } from 'rxjs';
import { ArticleSearchStore, ArticleSearchState } from './article-search.store';
import { MutationAnnotationArticleModel } from '../../models/mutation-annotation.model';

@Injectable({ providedIn: 'root' })
export class ArticleSearchQuery extends Query<ArticleSearchState> {
  constructor(protected store: ArticleSearchStore) {
    super(store);
  }

  articles(): Observable<MutationAnnotationArticleModel[]> {
    return this.select('articles');
  }
}
