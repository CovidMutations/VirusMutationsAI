import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, pluck, switchMap, take, takeUntil } from 'rxjs/operators';
import { MutationAnnotationService } from '../mutation-annotation.service';
import { MutationAnnotationArticleModel } from '../../models/mutation-annotation.model';
import { MyaccountService } from '../../myaccount/myaccount.service';
import { AuthQuery } from '../../auth/store/auth.query';
import { SharedService } from '../../shared/shared.service';
import { ArticleSearchQuery } from '../store/article-search.query';

const mutationRegEx = /^.{2,}[A-Z]$/;

@Component({
  selector: 'app-search-by-mutation',
  templateUrl: './search-by-mutation.component.html',
  styleUrls: ['./search-by-mutation.component.scss']
})
export class SearchByMutationComponent implements OnInit, OnDestroy {
  private mutationBS = new Subject<string>();
  private killSwitch = new Subject<void>();
  articleList: MutationAnnotationArticleModel[];

  constructor(
    private readonly mutationAnnotationService: MutationAnnotationService,
    private readonly articleSearchQuery: ArticleSearchQuery,
    private readonly accountService: MyaccountService,
    public readonly authQuery: AuthQuery,
    private readonly sharedService: SharedService,
    private toastr: ToastrService,
    private readonly translateService: TranslateService,
    private readonly router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.articleSearchQuery.articles()
      .pipe(takeUntil(this.killSwitch))
      .subscribe(articles => this.articleList = articles);

    this.mutationBS.pipe(
      debounceTime(300),
      takeUntil(this.killSwitch),
    ).subscribe(mutation => {
      const queryParams = { q: mutation };
      this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
    });

    this.route.queryParams.pipe(
      pluck('q'),  //  get mutation from the `q` query parameter
      map(this.canonizeMutation),
      filter(val => val && val !== this.articleSearchQuery.getValue().query),  //  take it if only it is not already in the store
      distinctUntilChanged(),
      filter(mutation => mutationRegEx.test(mutation)),
      switchMap(mutation => this.mutationAnnotationService.searchMutationAnnotationArticles(mutation)),
      takeUntil(this.killSwitch),
    ).subscribe({
      error: err => this.toastr.error(this.sharedService.extractErrorMessage(err))
    });
  }

  ngOnDestroy(): void {
    this.mutationBS.complete();
    this.killSwitch.next();
    this.killSwitch.complete();
  }

  onFilterListArticles(val): void {
    this.mutationBS.next(val.trim());
  }

  subscribe(mutation: string): void {
    this.accountService.subscribeToMutation(mutation)
      .pipe(take(1))
      .subscribe(
        () => this.toastr.success(this.translateService.instant('myaccount.subscribe.subscribeSuccess', { mutation }))
      );
  }

  private canonizeMutation(mutation: string): string | null {
    if (mutation) {
      return mutation.trim().toUpperCase();
    } else {
      return null;
    }
  }
}
