import {IsNotEmpty, IsEmail, IsString, MinLength, MaxLength, Matches} from 'class-validator';
import {BaseModel} from '../model/base.model';

export class UserDTO {


  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @MinLength(5)
  @MaxLength(50)
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


export class UserInfoRO extends BaseModel {
  id: string = undefined;
  username: string = undefined;
  email: string = undefined;
  constructor(row?){
    super(); super.checkFields(row);
  }
}

export class UserInfoTokenRO extends UserInfoRO {
  token?: string = undefined;
  constructor(row?){
    super(); super.checkFields(row);
  }
}

export class UserRO extends UserInfoRO {
  created: Date = undefined;
  token?: string = undefined;
  password?: string = undefined;

  constructor(row?){
    super(); super.checkFields(row);
  }
}
