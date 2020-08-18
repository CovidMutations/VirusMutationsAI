import { Injectable } from '@angular/core';
import {   Store, StoreConfig } from '@datorama/akita';
import {  AuthModel } from '../../models/auth.model';


export interface AuthState extends AuthModel { }

@Injectable({
  providedIn: 'root',
})
@StoreConfig({ name: 'Auth' })
export class  AuthStore extends Store<AuthState> {

  constructor() {
    super(new AuthModel());
  }
}

