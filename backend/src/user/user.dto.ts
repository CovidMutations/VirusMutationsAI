import {IsNotEmpty, IsEmail, IsString, MinLength, MaxLength, Matches} from 'class-validator';
import {BaseModel} from '../model/base.model';

export class UserDTO {


  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @MinLength(5)
  @MaxLength(20)
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(11)
  @Matches(/((?=.*d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: 'Password too weak'})
  password: string;

}

// tslint:disable-next-line:max-classes-per-file
export class UserDTOFull extends UserDTO {

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(11)
  username: string;

  

}

// tslint:disable-next-line:max-classes-per-file
export class UserRO extends BaseModel {
  id: string;
  username: string;
  email: string;
  created: Date;
  token?: string;
  password?: string;

  constructor(row?){
    super();
    this.checkFields(row);
  }
}
