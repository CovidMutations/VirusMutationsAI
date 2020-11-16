import { Component, OnDestroy, OnInit } from '@angular/core';
import { MutationAnnotationService } from '../mutation-annotation.service';
import { MutationAnnotationModel } from '../../models/mutation-annotation.model';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, filter, switchMap, take } from 'rxjs/operators';
import { MyaccountService } from '../../myaccount/myaccount.service';
import { AuthQuery } from '../../auth/store/auth.query';

@Component({
  selector: 'app-search-by-mutation',
  templateUrl: './search-by-mutation.component.html',
  styleUrls: ['./search-by-mutation.component.scss']
})
export class SearchByMutationComponent implements OnInit, OnDestroy {
  private mutationBS = new BehaviorSubject('');
  listArticles: MutationAnnotationModel[] = [];

  constructor(
    private readonly mutationAnnotationService: MutationAnnotationService,
    private readonly accountService: MyaccountService,
    public readonly authQuery: AuthQuery,
  ) { }

  ngOnInit(): void {
    this.mutationBS.pipe(
      distinctUntilChanged(),
      filter(mutation => /^[^>]+>{1,1}[^>]+$/gmi.test(mutation)),
      switchMap(mutation => this.mutationAnnotationService.searchMutationAnnotationArticles(mutation))
    ).subscribe(list => {
      this.listArticles = list || [];
    });
  }

  ngOnDestroy(): void {
    this.mutationBS.complete();
  }

  onFilterListArticles(val): void {
    this.mutationBS.next(val.trim());
  }

  subscribe(mutation: string): void {
    this.accountService.subscribeToMutation(mutation)
      .pipe(take(1))
      .subscribe();
  }
}
