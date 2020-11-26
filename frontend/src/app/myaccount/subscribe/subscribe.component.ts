import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { MyaccountService } from '../myaccount.service';
import { AuthQuery } from '../../auth/store/auth.query';
import { SharedService } from '../../shared/shared.service';

@Component({
  selector: 'app-subscribe',
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.scss']
})
export class SubscribeComponent implements OnInit {
  subscribeForm: FormGroup;
  frequencyForm: FormGroup;
  mutations: string[] = [];
  curPage = 0;
  hasNext = false;
  hasPrev = false;

  private itemsLimit = 10;

  constructor(
    private readonly accountService: MyaccountService,
    public readonly authQuery: AuthQuery,
    private readonly sharedService: SharedService,
    private readonly toastr: ToastrService,
    private readonly translateService: TranslateService,
  ) { }

  ngOnInit(): void {
    this.initFrequencyForm();
    this.initSubscribeForm();
    this.refreshMutations(this.curPage);
  }

  private initFrequencyForm(): void {
    this.accountService.getSubscriptionFrequency()
      .pipe(
        take(1),
      ).subscribe(v => {
        this.frequencyForm = new FormGroup({
          frequency: new FormControl(v, Validators.compose([
            Validators.required,
            Validators.min(0),
            Validators.pattern(/^[0-9]*$/),
          ])),
        });
      });
  }

  private initSubscribeForm(): void {
    this.subscribeForm = new FormGroup({
      mutation: new FormControl('',  Validators.required),
    });
  }

  private refreshMutations(page: number): void {
    const skip = page * this.itemsLimit;
    this.accountService.getMutations(this.itemsLimit, skip)
      .pipe(take(1))
      .subscribe(v => {
        this.mutations = v.items;
        this.hasPrev = page > 0;
        this.hasNext = v.total > (page + 1) * this.itemsLimit;
      });
  }

  prevPage(): void {
    this.curPage = this.curPage - 1;
    this.refreshMutations(this.curPage);
  }

  nextPage(): void {
    this.curPage = this.curPage + 1;
    this.refreshMutations(this.curPage);
  }

  subscribe(): void {
    const mutation = this.subscribeForm.value.mutation;
    this.accountService.subscribeToMutation(mutation)
      .pipe(take(1))
      .subscribe(() => {
        this.toastr.success(this.translateService.instant('myaccount.subscribe.subscribeSuccess', { mutation }));
        this.refreshMutations(this.curPage);
        this.subscribeForm.reset();
      });
  }

  unsubscribe(mutation: string): void {
    this.accountService.unsubscribeFromMutation(mutation)
      .pipe(take(1))
      .subscribe(() => {
        this.toastr.success(this.translateService.instant('myaccount.subscribe.unsubscribeSuccess', { mutation }));
        this.refreshMutations(this.curPage);
      });
  }

  setFrequency(): void {
    this.accountService.setSubscriptionFrequency(this.frequencyForm.value.frequency)
      .pipe(take(1))
      .subscribe(
        () => this.toastr.success(this.translateService.instant('myaccount.subscribe.setFrequencySuccess')),
        err => this.toastr.error(this.sharedService.extractErrorMessage(err)),
      );
  }
}
