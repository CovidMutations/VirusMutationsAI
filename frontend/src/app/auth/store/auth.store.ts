import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { AuthState } from '../../models/auth.model';

function createInitialState(): AuthState {
  return new AuthState();
}

@Injectable({
  providedIn: 'root',
})
@StoreConfig({ name: 'Auth' })
export class AuthStore extends Store<AuthState> {
  constructor() {
    super(createInitialState());
  }

  public login(session: AuthState): void {
    this.update(session);
  }

  public logout(): void {
    this.update(createInitialState());
  }
}

