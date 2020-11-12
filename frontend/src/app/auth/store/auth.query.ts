import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { AuthStore } from './auth.store';
import { AuthState } from '../../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthQuery extends Query<AuthState> {
  isLoggedIn$ = this.select(state => !!state.accessToken);

  constructor(protected store: AuthStore) {
    super(store);
  }

  public isLoggedIn(): boolean {
    return !!this.getValue().accessToken;
  }
}
