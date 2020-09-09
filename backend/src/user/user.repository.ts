import { EntityRepository, Repository } from 'typeorm';
import { ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from './user.entity';
import { LoginDTO } from '../model/auth.model';
import { UserDTOFull, UserDTO, UserRO } from './user.dto';
import { JwtService } from '@nestjs/jwt';

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
  logger = new Logger('UserRepository');


  constructor(
    private jwtService: JwtService
  ) {
    super();
  }

  async signUp(authCredentalsDTO: UserDTOFull): Promise<UserRO> {
    this.logger.verbose(`signUp: ${authCredentalsDTO}`);
    const {username, password, email} = authCredentalsDTO;

    const user = new UserEntity();
    user.username = username;
    user.salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(password + process.env.SECRET, user.salt);
    user.email = email;
    try {
     await user.save();
     return user.toResponseObject();
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException({
          error: 'User already exist',
        });
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUserPassword(authCredentalsDTO: UserDTO): Promise<UserRO> {
    this.logger.verbose(`validateUserPassword: ${JSON.stringify(authCredentalsDTO)}`);
    const {username, password} = authCredentalsDTO;

    const user = await this.findOne({ username });
    this.logger.verbose(`validateUserPassword user: ${JSON.stringify(user)}`);

    console.log('validatePassword', password, await user.validatePassword(password));

    if (user && await user.validatePassword(password)) {
      return user.toResponseObject();
    } else {
      return null;
    }

  }


}
