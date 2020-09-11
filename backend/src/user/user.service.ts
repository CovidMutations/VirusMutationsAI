import { Injectable, Logger, HttpException, HttpStatus, Query, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { UserDTO, UserDTOFull, UserRO } from './user.dto';
import { Repository, DeleteResult } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from './user.repository';



@Injectable()
export class UserService {
  private logger = new Logger('UserService');
  constructor(
    private readonly userRepository: UserRepository
  ) { }

  
  // async registration(data: UserDTOFull): Promise<UserRO> {
  //   this.logger.verbose('registration');
  //     return await this.userRepository.signUp(data);
  // }

  // async login(data: UserDTO): Promise<UserRO> {
  //   this.logger.verbose('login');
  //   return await this.userRepository.signIn(data);
  // }

  // async login(loginCredentalsDTO: UserDTO): Promise<any> {
  //   this.logger.verbose('login');

  //   const {email, password} = loginCredentalsDTO;
  //   const _user = await this.userRepository.findOne({email});
  //   if (!_user || !(await _user.validatePassword(password))) {
  //     throw new HttpException(
  //       'Invalid username/password',
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }

  //   console.log('this.jwtService', this.jwtService)
  //   return new UserRO({
  //     ..._user,
  //     token: this.jwtService.sign(_user)
  //   });
  // }

 
  async showAll(page: number = 1): Promise<UserRO[]> {
     const users = await this.userRepository.find();
      
     return users.map(user => new UserRO(user));
  }

  async read(id: string) {
    const user = await this.userRepository.findOne({id });
    if (!user) {
      throw new NotFoundException();
    }
    return new UserRO(user);
  }


  async update(id: string, data: UserDTO): Promise<UserRO> {
    const user = await this.userRepository.findOne({where: {id}});
    if (user) {
      await this.userRepository.update({id}, data);
      const updateUser = await this.userRepository.findOne({where: {id}});

      return new UserRO(updateUser);
    }
  }

  async find() {
    return await this.userRepository.find();
  }

  async findByLogin(userDTO: UserDTO): Promise<UserRO> {
    const { email, password } = userDTO;
    const user = await this.userRepository.findOne({ email });
    
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    if (await bcrypt.compare(String(password), String(user.password))) {
      return this.sanitizeUser(user);
    } else {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
  }

  async findByPayload(payload) {
    const { username } = payload;
    return await this.userRepository.findOne({ username });
  }

  sanitizeUser(user: UserDTO): UserRO {
    const sanitized = user;
    delete sanitized['password'];
    return sanitized as UserRO;
  }


  
  async deleteUser(userId: string): Promise<DeleteResult> {
    return await this.userRepository.delete({ id: userId });
  }

 
}
