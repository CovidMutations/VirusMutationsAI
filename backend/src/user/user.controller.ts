import { Controller, Post, Logger, Body, Get, UseGuards, Delete, Param, Put, CacheInterceptor, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDTO, UserDTOFull, UserRO } from './user.dto';
// import { ValidationPipe } from 'src/shared/validation.pipe';
// import { User } from './user.decorator';
// import { RoleGuard } from '../shared/role.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';



@Controller('api')
// @UseInterceptors(CacheInterceptor)
export class UserController {
    private logger = new Logger('UserController');
    constructor(
        private userService: UserService,
    ) {}
    
    // @Post('/registration')
    // registration(@Body() res: UserDTOFull): Promise<UserRO> {
    //     this.logger.log(`registration ${JSON.stringify(res)}`);
    //     return this.userService.registration(res);
    // }

    // @Post('/login')
    // login(@Body() res: UserDTO): Promise<UserRO> {
    //     this.logger.log(`login ${JSON.stringify(res)}`);
    //     return this.userService.login(res);
    // }

  /*   @Get('users')
    showAllUsers(@Query('page') page: number) {
        return this.userService.showAll(page);
    } */

    @Get('user/:id')
    @UseGuards(JwtAuthGuard)
    read(@Param('id') id: string) {
        return this.userService.read(id);
    }

}
