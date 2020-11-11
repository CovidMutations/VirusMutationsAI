import { IsNotEmpty, IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { BaseModel } from '../model/base.model';

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
  @MaxLength(50)
  password: string;
}

// tslint:disable-next-line:max-classes-per-file
export class UserDTOFull extends UserDTO {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
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

export class UserRO extends UserInfoRO {
  created: Date = undefined;
  token?: string = undefined;
  password?: string = undefined;

  constructor(row?){
    super(); super.checkFields(row);
  }
}
