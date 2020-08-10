import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpParameterCodec} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { APP_CONFIG, IAppConfig } from '../app.config';
import { SharedService } from '../shared/shared.service';

import { HashMap } from '@datorama/akita';
import { DBUpdatingFrequencyEnum } from '../models/admin-db.model';

// import {Apollo} from 'apollo-angular';
// import gql from 'graphql-tag';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly updatefrequencyEndpoint = 'frequency';
  private readonly updatedbEndpoint = 'updatedb';
  private API_URL;
  constructor(
    private readonly http: HttpClient,
    private readonly sharedService: SharedService,
    @Inject(APP_CONFIG) config: IAppConfig,
  ) {
    this.API_URL = config.apiEndpoint;
  }

  setFrequency(frequency: DBUpdatingFrequencyEnum): Observable<any> {

    return this.http.post(this.API_URL + this.updatefrequencyEndpoint, {frequency}, {responseType: 'text'})
    .pipe(
      tap(
        data => {},
        err => {
          this.sharedService.errorModal('Error: ' + err.error.message);
        }
      )
    );
  }

  getFrequency(): Observable<any> {
    return this.http.get(this.API_URL + this.updatefrequencyEndpoint, {responseType: 'text'})
    .pipe(
      tap(
        data => {},
        err => {
          this.sharedService.errorModal('Error: ' + err.error.message);
        }
      )
    );
  }

  updateDB(): Observable<any> {
    return this.http.post(this.API_URL + this.updatedbEndpoint, {}, {responseType: 'text'})
    .pipe(
      tap(
        data => {},
        err => {
          this.sharedService.errorModal('Error: ' + err.error.message);
        }
      )
    );
  }

  getUpdateDBDate(): Observable<any> {
    return this.http.get(this.API_URL + this.updatedbEndpoint)
    .pipe(
      tap(
        data => {},
        err => {
          this.sharedService.errorModal('Error: ' + err.error.message);
        }
      )
    );
  }

}

