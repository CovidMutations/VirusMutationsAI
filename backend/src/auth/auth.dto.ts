import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class OAuth2PasswordRequestDTO {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @MinLength(5)
  @MaxLength(50)
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  password: string;

  grant_type: string;
  scopes: string[];
  client_id: string;
  client_secret: string;
}

export class Token {
  access_token: string;
  token_type: string;
}

export class TokenPayload {
  sub: string;
  email: string;
  username: string;
}
