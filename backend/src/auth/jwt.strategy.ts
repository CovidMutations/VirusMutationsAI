import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { UserRO } from '../user/user.dto';
import { OAuth2PasswordRequestDTO } from './auth.dto';
import * as config from 'config';
const jwtConfig = config.get('jwt');


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userRepository: UserRepository
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  async validate(payload: OAuth2PasswordRequestDTO): Promise<UserRO> {
    const user = await this.userRepository.validateUserPassword(payload.username, payload.password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
   // return { userId: payload.sub, username: payload.username };
  }
}
