import {IsNotEmpty, IsEmail, IsString, MinLength, MaxLength, Matches} from 'class-validator';

export class UserDTO {

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(11)
  username: string;

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
  @IsEmail()
  email: string;

}

// tslint:disable-next-line:max-classes-per-file
export class UserRO {
  id: string;
  username: string;
  email: string;
  created: Date;
  token?: string;
  password?: string;
}
