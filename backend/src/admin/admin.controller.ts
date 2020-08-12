import { Controller, Logger, Post, Get, UseInterceptors, UploadedFile, Param, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { extname } from 'path';
import { diskStorage } from 'multer';
import {SetFrequencyDTO, ResUpdateDBModel} from '../model/admin.model';


@Controller('api')
export class AdminController {
  private logger = new Logger('AdminController');
  constructor(private readonly adminService: AdminService) {}

  @Get('/frequency')
  getFrequency(): Promise<string> {
    this.logger.verbose(`getFrequency`);
    return this.adminService.getFrequency();
  }

  @Post('/frequency')
  setFrequency(@Body() res: SetFrequencyDTO): Promise<string> {
    this.logger.log(`setFrequency ${JSON.stringify(res)}`);
    return this.adminService.setFrequency(res);
  }

  @Get('/updatedb')
  getUpdateDBDate(): Promise<number> {
    this.logger.verbose(`getUpdateDBDate`);
    return this.adminService.getUpdateDBDate();
  }

  @Post('/updatedb')
  updateDB(): Promise<ResUpdateDBModel> {
    this.logger.verbose(`setUpdateDBDate`);
    return this.adminService.updateDB();
  }


}
