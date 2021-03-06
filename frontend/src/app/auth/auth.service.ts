import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { APP_CONFIG, IAppConfig } from '../app.config';
import { SharedService } from '../shared/shared.service';
import { AuthStore } from './store/auth.store';
import { AuthQuery } from './store/auth.query';
import {
  UserInfoModel,
  RegistrationFormModel,
  LoginFormModel,
  TokenResp,
  AuthState,
  TokenPayload
} from '../models/auth.model';
import { HttpUrlStandardEncodingCodec } from '../shared/http-url-encoding-codec';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly regEndpoint = '/v1/auth/registration';
  private readonly loginEndpoint = '/v1/auth/access-token';
  private readonly codeVerificationEndpoint = '/v1/auth/registration/activation';
  private readonly API2_URL;

  constructor(
    private readonly http: HttpClient,
    private readonly authStore: AuthStore,
    private readonly authQuery: AuthQuery,
    private readonly sharedService: SharedService,

    @Inject(APP_CONFIG) config: IAppConfig
  ) {
    this.API2_URL = config.apiEndpoint2;
    this.getAuthInfo();
   }


  getAuthInfo(): Observable<UserInfoModel> {
    return this.authQuery.select();
  }

  registration(formVal: RegistrationFormModel): any {
    return this.http.post(this.API2_URL + this.regEndpoint, formVal);
  }

  login(formVal: LoginFormModel): Observable<AuthState> {
    const body = new HttpParams({ encoder: new HttpUrlStandardEncodingCodec() })
      .append('username', formVal.email)
      .append('password', formVal.password);
    return this.http.post<TokenResp>(this.API2_URL + this.loginEndpoint, body).pipe(
      map(data => this.tokenToAuthState(data.access_token)),
      tap(authState => this.authStore.login(authState)),
    );
  }

  logout(): void {
    this.authStore.logout();
  }

  confirmCodeVerification(userId: string, code: string): Observable<any> {
    return this.http.put(this.API2_URL + this.codeVerificationEndpoint + '/' + userId, { code });
  }

  private extractJWTPayload(token: string): TokenPayload | null {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.warn('Couldn\'t parse JWT');
      return null;
    }
  }

  private tokenToAuthState(token: string): AuthState {
    const payload = this.extractJWTPayload(token);
    return new AuthState({
      accessToken: token,
      name: payload && payload.username,
      email: payload && payload.email,
    });
  }
}
