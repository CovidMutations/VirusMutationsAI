import {IsString, IsEmail, IsBoolean, IsNotEmpty, IsEmpty, IsBooleanString} from 'class-validator';


export class RegistrationDTO {
  @IsString()
  username: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;

}


export class LoginDTO {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;

}

