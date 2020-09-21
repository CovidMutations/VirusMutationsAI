import {BaseModel} from './base.model';
import {IsNotEmpty, IsEmail, IsString, MinLength, MaxLength, IsNumber} from 'class-validator';


export class MailModel extends BaseModel {
  from: string = undefined;
  to: string = undefined;
  subject: string = undefined;
  html: string = undefined;

  constructor(row?){
    super(); super.checkFields(row);
  }
}

