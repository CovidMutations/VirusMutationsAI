import {BaseModel} from './base.model';


export class UserInfoModel extends BaseModel {
  name: string = undefined;
  email: string = undefined;
  constructor(row?){
    super(); super.checkFields(row);
  }
}

export class AuthState extends UserInfoModel {
  accessToken: string = undefined;

  constructor(row?){
    super();
    super.checkFields(row);
  }
}

export class RegistrationFormModel extends BaseModel {
  name: string = undefined;
  email: string = undefined;
  password: string = undefined;
  constructor(row?){
    super(); super.checkFields(row);
  }
}


export class LoginFormModel extends BaseModel {
  email: string = undefined;
  password: string = undefined;
  constructor(row?){
    super(); super.checkFields(row);
  }
}

// tslint:disable:variable-name
export interface TokenResp {
  token_type: string;
  access_token?: string;
}
// tslint:enable:variable-name

export interface TokenPayload {
  sub: string;
  email: string;
  username: string;
}
