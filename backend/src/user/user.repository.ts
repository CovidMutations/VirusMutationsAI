import { EntityRepository, Repository } from 'typeorm';
import { ConflictException, InternalServerErrorException, Logger, HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from './user.entity';
import { UserDTOFull, UserDTO, UserRO } from './user.dto';
import { JwtService } from '@nestjs/jwt';
import * as config from 'config';
const jwtConfig = config.get('jwt');

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
  logger = new Logger('UserRepository');


  constructor(
    private readonly jwtService: JwtService
  ) {
    super();
  }

  async signUp(authCredentalsDTO: UserDTOFull): Promise<UserRO> {
    this.logger.verbose(`signUp: ${authCredentalsDTO}`);
    const {username, password, email} = authCredentalsDTO;

    const user = new UserEntity();
    user.username = username;
    user.salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(password + jwtConfig.secret, user.salt);
    user.email = email;
    try {
     await user.save();
     return new UserRO(user);
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

  async signIn(loginCredentalsDTO: UserDTO): Promise<any> {
    const {email, password} = loginCredentalsDTO;
    const _user = await this.findOne({email});
    if (!_user || !(await _user.validatePassword(password))) {
      throw new HttpException(
        'Invalid username/password',
        HttpStatus.BAD_REQUEST,
      );
    }

    console.log('this.jwtService', this.jwtService)
    return new UserRO({
      ..._user,
      token: this.jwtService.sign(_user)
    });
  }

  async validateUserPassword(authCredentalsDTO: UserDTO): Promise<UserRO> {
    this.logger.verbose(`validateUserPassword: ${JSON.stringify(authCredentalsDTO)}`);
    const {email, password} = authCredentalsDTO;

    const user = await this.findOne({ email });
    this.logger.verbose(`validateUserPassword user: ${JSON.stringify(user)}`);

    if (user && await user.validatePassword(password)) {
      return new UserRO(user);
    } else {
      return null;
    }

  }

  


}
