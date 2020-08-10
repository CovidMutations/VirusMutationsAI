import { Controller, Logger, Post, Get, UseInterceptors, UploadedFile, Param, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { extname } from 'path';
import { diskStorage } from 'multer';
import {SetFrequencyDTO} from '../model/admin.model';


@Controller('api')
export class AdminController {
  private logger = new Logger('AdminController');
  constructor(private readonly AdminService: AdminService) {}

  @Get('/frequency')
  getFrequency(): Promise<string> {
    this.logger.verbose(`getFrequency`);
    return this.AdminService.getFrequency();
  }

  @Post('/frequency')
  setFrequency(@Body() res: SetFrequencyDTO): Promise<string> {
    this.logger.log(`setFrequency ${JSON.stringify(res)}`);
    return this.AdminService.setFrequency(res);
  }

  @Get('/updatedb')
  getUpdateDBDate(): Promise<number> {
    this.logger.verbose(`getUpdateDBDate`);
    return this.AdminService.getUpdateDBDate();
  }

  @Post('/updatedb')
  setUpdateDBDate(): Promise<number> {
    this.logger.verbose(`setUpdateDBDate`);
    return this.AdminService.setUpdateDBDate();
  }


}
