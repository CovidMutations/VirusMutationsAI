import { Injectable } from '@angular/core';
import { HashMap } from '@datorama/akita';
import { asapScheduler, combineLatest, Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { SharedService } from '../shared/shared.service';
import { MutationAnnotationStore } from './store/mutation-annotation.store';
import { MutationAnnotationQuery } from './store/mutation-annotation.query';
import { MutationAnnotationArticleModel } from '../models/mutation-annotation.model';
import { ArticleSearchApi } from './store/article-search.api';
import { ArticleSearchStore } from './store/article-search.store';
import { ArticleSearchQuery } from './store/article-search.query';


@Injectable({
  providedIn: 'root'
})
export class MutationAnnotationService {
  constructor(
    private readonly mutationAnnotationStore: MutationAnnotationStore,
    private readonly mutationAnnotationQuery: MutationAnnotationQuery,
    private readonly articleSearchStore: ArticleSearchStore,
    private readonly articleSearchQuery: ArticleSearchQuery,
    private readonly api: ArticleSearchApi,
    private readonly sharedService: SharedService,
  ) {
    combineLatest([
      this.mutationAnnotationQuery.selectLoading(),
      this.articleSearchQuery.selectLoading(),
    ]).subscribe(loadingStates => {
      this.sharedService.setLoader(loadingStates[0] || loadingStates[1]);
    });
   }

  uploadVCF(file, snpEffect = false): Observable<HashMap<MutationAnnotationArticleModel[]>> {
    return of(null, asapScheduler).pipe(
      tap(() => this.mutationAnnotationStore.setLoading(true)),
      switchMap(() => this.api.searchByVcf(file, snpEffect)),
      tap(
        data => {
          this.mutationAnnotationStore.setLoading(false);
          this.mutationAnnotationStore.set(data);
        },
        () => this.mutationAnnotationStore.setLoading(false)
      )
    );
  }

  searchMutationAnnotationArticles(mutation: string): Observable<MutationAnnotationArticleModel[]> {
    return of(null, asapScheduler).pipe(
      tap(() => this.articleSearchStore.setLoading(true)),
      switchMap(() => this.api.search(mutation)),
      tap(
        articles => {
          this.articleSearchStore.update({ articles, query: mutation });
          this.articleSearchStore.setLoading(false);
        },
        () => this.articleSearchStore.setLoading(false)
      )
    );
  }
}
