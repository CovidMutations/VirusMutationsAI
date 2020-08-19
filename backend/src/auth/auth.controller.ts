import { Controller, Logger, Post, Get, UseInterceptors, UploadedFile, Param, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import {RegistrationDTO, LoginDTO} from '../model/auth.model';


@Controller('api')
export class AuthController {
  private logger = new Logger('AuthController');
  constructor(private readonly authService: AuthService) {}

  @Post('/registration')
  registration(@Body() res: RegistrationDTO): Promise<string> {
    this.logger.log(`registration ${JSON.stringify(res)}`);
    return this.authService.registration(res);
  }

  @Post('/login')
  login(@Body() res: LoginDTO): Promise<string> {
    this.logger.log(`login ${JSON.stringify(res)}`);
    return this.authService.login(res);
  }

  // @Get('/updatedb')
  // getUpdateDBDate(): Promise<ResUpdateDBModel> {
  //   this.logger.verbose(`getUpdateDBDate`);
  //   return this.adminService.getUpdateDBDate();
  // }

  // @Post('/updatedb')
  // updateDB(): Promise<ResUpdateDBModel> {
  //   this.logger.verbose(`setUpdateDBDate`);
  //   return this.adminService.updateDB();
  // }


}
