import { Injectable, Logger, HttpException, HttpStatus, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { UserDTO, UserDTOFull, UserInfoTokenRO } from '../user/user.dto';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../user/user.repository';
import { UserEntity } from '../user/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as config from 'config';
const jwtConfig = config.get('jwt');


@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService
  ) { }

  
  async registration(authCredentalsDTO: UserDTOFull): Promise<UserInfoTokenRO> {
    this.logger.verbose('registration');
     
    this.logger.verbose(`signUp: ${authCredentalsDTO}`);
    const {username, password, email} = authCredentalsDTO;

    const user = new UserEntity();
    user.username = username;
    user.salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(password + jwtConfig.secret, user.salt);
    user.email = email;
    try {
     await user.save();
     return new UserInfoTokenRO(user);
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


  async login(loginCredentalsDTO: UserDTO): Promise<any> {
    this.logger.verbose('login');

    const {email, password} = loginCredentalsDTO;
    const _user = await this.userRepository.findOne({email});
    if (!_user || !(await _user.validatePassword(password))) {
      throw new HttpException(
        'Invalid username/password',
        HttpStatus.BAD_REQUEST,
      );
    }

    return new UserInfoTokenRO({
      ..._user,
      token: this.jwtService.sign(loginCredentalsDTO)
    });
  }

 
 
}
