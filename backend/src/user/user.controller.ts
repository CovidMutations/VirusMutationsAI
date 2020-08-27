import { Controller, Post, Logger, Body, Query, UseGuards, Delete, Param, Put, CacheInterceptor, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDTO, UserDTOFull } from './user.dto';
// import { ValidationPipe } from 'src/shared/validation.pipe';
// import { User } from './user.decorator';
// import { RoleGuard } from '../shared/role.guard';
import {RegistrationDTO, LoginDTO} from '../model/auth.model';


@Controller('api')
// @UseInterceptors(CacheInterceptor)
export class UserController {
    private logger = new Logger('UserController');
    constructor(
        private userService: UserService,
    ) {}

    
  @Post('/registration')
  registration(@Body() res: RegistrationDTO): Promise<string> {
    this.logger.log(`registration ${JSON.stringify(res)}`);
    return this.userService.registration(res);
  }

  @Post('/login')
  login(@Body() res: LoginDTO): Promise<string> {
    this.logger.log(`login ${JSON.stringify(res)}`);
    return this.userService.login(res);
  }

  /*   @Get('users')
    showAllUsers(@Query('page') page: number) {
        return this.userService.showAll(page);
    } */

  /*   @Get('user/:username')
    // @UseGuards(AuthGuard())
    read(@Param('username') username: string) {
        return this.userService.read(username);
    } */

/*     @Post('login')
    login(@Body() data: UserDTO) {
        return this.userService.login(data);
    }

    @Post('register')
    register(@Body() data: UserDTOFull) {
        return this.userService.register(data);
    } */
/* 
    @Put('user/:id')
    update(@Param('id') id: string, @Body() data: UserDTOFull) {
        return this.userService.update(id, data);
    } */

}
