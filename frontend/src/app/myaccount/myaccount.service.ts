import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { APP_CONFIG, IAppConfig } from '../app.config';
import { SharedService } from '../shared/shared.service';

export interface PaginatedMutations {
  items: string[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class MyaccountService {
  private readonly subscriptionFrequencyEndpoint = '/v1/user/me/config/subscription-interval';
  private readonly subscriptionMutationsEndpoint = '/v1/user/me/subscriptions';
  private readonly API_URL2;

  constructor(
    private readonly http: HttpClient,
    private readonly sharedService: SharedService,
    @Inject(APP_CONFIG) config: IAppConfig,
  ) {
    this.API_URL2 = config.apiEndpoint2;
  }

  getSubscriptionFrequency(): Observable<number> {
    const url = `${this.API_URL2}${this.subscriptionFrequencyEndpoint}`;

    return this.http.get<number>(url)
      .pipe(
        catchError(err => {
          if (err.status === 404) {
            return of(0);  //  Return 0 if subscription frequency is not set
          }
          this.sharedService.errorModal('Error: ' + err.error.detail);
          throw err;
        })
      );
  }

  setSubscriptionFrequency(days: number): Observable<void> {
    const url = `${this.API_URL2}${this.subscriptionFrequencyEndpoint}`;
    const body = {
      subscription_interval: days,
    };

    return this.http.put(url, body, { responseType: 'text' })
      .pipe(
        map(
          () => null,
          err => {
            this.sharedService.errorModal('Error: ' + err.error.message);
            throw err;
          }
        )
      );
  }

  getMutations(limit = 100, skip = 0): Observable<PaginatedMutations> {
    const url = `${this.API_URL2}${this.subscriptionMutationsEndpoint}`;
    const params = new HttpParams()
      .append('limit', `${limit}`)
      .append('skip', `${skip}`);

    return this.http.get<PaginatedMutations>(url, { params });
  }

  subscribeToMutation(mutation: string): Observable<void> {
    const url = `${this.API_URL2}${this.subscriptionMutationsEndpoint}/${mutation}`;
    return this.http.put<null>(url, null);
  }

  unsubscribeFromMutation(mutation: string): Observable<void> {
    const url = `${this.API_URL2}${this.subscriptionMutationsEndpoint}/${mutation}`;
    return this.http.delete<null>(url);
  }
}
