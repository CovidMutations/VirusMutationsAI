import {BaseModel} from './base.model';


export class UserInfoModel extends BaseModel {
  name: string = undefined;
  email: string = undefined;
  constructor(row?){
    super(); super.checkFields(row);
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


export class UserRO {
  id: string;
  username: string;
  email: string;
  created: Date;
  token?: string;
}


