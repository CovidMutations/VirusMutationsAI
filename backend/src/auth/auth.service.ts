import { Injectable, Logger, InternalServerErrorException, HttpStatus } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import {promisify} from 'util';

import {RegistrationDTO, LoginDTO} from '../model/auth.model';


@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');


  constructor(
  ) {
  
  }

  async registration(res: RegistrationDTO): Promise<string> {
    this.logger.verbose('registration');
    
  
    return '';
  }

  async login(res: LoginDTO): Promise<string> {
    this.logger.verbose('login');
  
    return '';
  }



}
