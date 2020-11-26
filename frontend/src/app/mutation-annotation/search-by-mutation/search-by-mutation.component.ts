import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { MutationAnnotationService } from '../mutation-annotation.service';
import { MutationAnnotationModel } from '../../models/mutation-annotation.model';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, distinctUntilChanged, filter, map, switchMap, take } from 'rxjs/operators';
import { MyaccountService } from '../../myaccount/myaccount.service';
import { AuthQuery } from '../../auth/store/auth.query';
import { SharedService } from '../../shared/shared.service';

const mutationRegEx = /^.{2,}[A-Z]$/;

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
    private readonly sharedService: SharedService,
    private toastr: ToastrService,
    private readonly translateService: TranslateService,
  ) { }

  ngOnInit(): void {
    this.mutationBS.pipe(
      map(v => v.trim().toUpperCase()),
      distinctUntilChanged(),
      filter(mutation => mutationRegEx.test(mutation)),
      switchMap(mutation => {
        return this.mutationAnnotationService.searchMutationAnnotationArticles(mutation).pipe(
          catchError(err => {
            this.toastr.error(this.sharedService.extractErrorMessage(err));
            return of([]);
          })
        );
      }),
    ).subscribe(list => this.listArticles = list);
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
      .subscribe(
        () => this.toastr.success(this.translateService.instant('myaccount.subscribe.subscribeSuccess', { mutation }))
      );
  }
}
