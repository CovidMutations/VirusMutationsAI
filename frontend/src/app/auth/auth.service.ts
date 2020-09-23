import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpParameterCodec} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { APP_CONFIG, IAppConfig } from '../app.config';
import { SharedService } from '../shared/shared.service';
import { AuthStore } from './store/auth.store';
import { AuthQuery } from './store/auth.query';
import { UserInfoModel, RegistrationFormModel, LoginFormModel, UserRO } from '../models/auth.model';
import { HashMap } from '@datorama/akita';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private regEndpoint = 'registration';
  private loginEndpoint = 'login';
  private codeVerificationEndpoint = 'confirm-code-verification';
  private API_URL;

  constructor(
    private readonly http: HttpClient,
    private readonly authStore: AuthStore,
    private readonly authQuery: AuthQuery,
    private readonly sharedService: SharedService,

    @Inject(APP_CONFIG) config: IAppConfig
  ) {
    this.API_URL = config.apiEndpoint;
    this.getAuthInfo();
   }


  getAuthInfo(): Observable<UserInfoModel> {
    return this.authQuery.select();
  }

  registration(formVal: RegistrationFormModel): any {
    return this.http.post(this.API_URL + this.regEndpoint, formVal);
  }

  login(formVal: LoginFormModel): Observable<UserRO> {
    return this.http.post(this.API_URL + this.loginEndpoint, formVal) as Observable<UserRO>;
  }

  confirmCodeVerification(userId: string, code: string): Observable<any> {
    return this.http.get(this.API_URL + this.codeVerificationEndpoint + '/' + userId + '/' + code) as Observable<any>;
  }

}
