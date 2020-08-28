import { Injectable, Logger, HttpException, HttpStatus, Query, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { UserDTO, UserRO } from './user.dto';
import { Repository, DeleteResult } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from './user.repository';
import {RegistrationDTO, LoginDTO} from '../model/auth.model';


@Injectable()
export class UserService {
  private logger = new Logger('UserService');
  constructor(
    private userRepository: UserRepository,
  ) { }

  
  async registration(data: RegistrationDTO): Promise<UserRO> {
    this.logger.verbose('registration');
      const {email} = data;
      let user = await this.userRepository.findOne({where: {email}});
      this.logger.verbose(`user: ${JSON.stringify(user)}`);
      if (user) {
        throw new HttpException('User already exist', HttpStatus.BAD_REQUEST);
      }

      user = await this.userRepository.create(data);
      await this.userRepository.save(user);
      return user.toResponseObject();
      

  }



  async login(data: LoginDTO): Promise<UserRO> {
    this.logger.verbose('login');

    const {email, password} = data;
    const user = await this.userRepository.findOne({where: {email}});
    if (!user || !(await user.comparePassword(password))) {
      throw new HttpException(
        'Invalid username/password',
        HttpStatus.BAD_REQUEST,
      );
    }
    return user.toResponseObject();
  }


  // async register(data: UserDTO): Promise<UserRO> {
  //   const {username} = data;
  //   let user = await this.userRepository.findOne({where: {username}});

  //   if (user) {
  //     throw new HttpException('User already exist', HttpStatus.BAD_REQUEST);
  //   }

  //   user = await this.userRepository.create(data);
  //   await this.userRepository.save(user);

  //   return user.toResponseObject();
  // }


 
  async showAll(page: number = 1): Promise<UserRO[]> {
     const users = await this.userRepository.find();
      
     return users.map(user => user.toResponseObject(false));
  }

  async read(username: string, isShowPassword = false) {
    const user = await this.userRepository.findOne({
      where: {username},
    });
    if (!user) {
      throw new NotFoundException();
    }
    return user.toResponseObject(isShowPassword);
  }


  async update(id: string, data: UserDTO): Promise<UserRO> {
    const user = await this.userRepository.findOne({where: {id}});
    if (user) {
      await this.userRepository.update({id}, data);
      const updateUser = await this.userRepository.findOne({where: {id}});

      return updateUser.toResponseObject();
    }
  }

  async find() {
    return await this.userRepository.find();
  }

  async findByLogin(userDTO: LoginDTO): Promise<UserRO> {
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
