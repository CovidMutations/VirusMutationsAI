import { Injectable, Logger, InternalServerErrorException, HttpStatus } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import {promisify} from 'util';

@Injectable()
export class AdminService {
  private logger = new Logger('AdminService');

  async getFrequency(): Promise<string> {
    this.logger.verbose('getFrequency');
    return "weekly"
  }

  async getUpdateDBDate(): Promise<number> {
    this.logger.verbose('getFrequency');
    return Date.now();
  }

  

}
