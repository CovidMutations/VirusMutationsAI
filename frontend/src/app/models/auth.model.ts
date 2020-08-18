import {BaseModel} from './base.model';


export class AuthModel extends BaseModel {
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
