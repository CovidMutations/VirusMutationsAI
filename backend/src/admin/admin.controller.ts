import { Controller, Logger, Post, Get, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { extname } from 'path';
import { diskStorage } from 'multer';
//import {AdminModel} from '../model/mutation-annotation.model';


@Controller('api')
export class AdminController {
  private logger = new Logger('AdminController');
  constructor(private readonly AdminService: AdminService) {}

  @Get('/frequency')
  getFrequency(): Promise<string> {
    this.logger.verbose(`getFrequency`);
    return this.AdminService.getFrequency();
  }

  @Get('/updatedb')
  getUpdateDBDate(): Promise<number> {
    this.logger.verbose(`getUpdateDBDate`);
    return this.AdminService.getUpdateDBDate();
  }


}
