import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { UserDTO } from '../user/user.dto';
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

  async validate(payload: UserDTO) {
    const user = await this.userRepository.validateUserPassword(payload);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
   // return { userId: payload.sub, username: payload.username };
  }
}