import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpParameterCodec} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { APP_CONFIG, IAppConfig } from '../app.config';
import { SharedService } from '../shared/shared.service';
import { AuthStore } from './store/auth.store';
import { AuthQuery } from './store/auth.query';
import { UserInfoModel, RegistrationFormModel, LoginFormModel } from '../models/auth.model';
import { HashMap } from '@datorama/akita';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  regEndpoint = 'registration';
  loginEndpoint = 'login';

  API_URL;
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
 //   console.log(new UserInfoModel(formVal));
  //  this.authStore.update(new UserInfoModel(formVal));
    return this.http.post(this.API_URL + this.regEndpoint, formVal);
  }

  login(formVal: LoginFormModel): void {
 //   console.log(new UserInfoModel(formVal));
 //   this.authStore.update(new UserInfoModel(formVal));
//    this.http.post(this.API_URL + this.regEndpoint, fd,  {
  }

}
