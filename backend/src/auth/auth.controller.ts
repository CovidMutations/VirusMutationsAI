import { Controller, Post, Logger, Body, Get, UseGuards, Delete, Param, Put, CacheInterceptor, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDTO, UserDTOFull, UserInfoTokenRO } from '../user/user.dto';
import { EmailVerificationModel } from '../model/mail.dto';

@Controller('api')
// @UseInterceptors(CacheInterceptor)
export class AuthController {
    private logger = new Logger('AuthController');
    constructor(
        private authService: AuthService,
    ) {}
    
    @Post('/registration')
    registration(@Body() res: UserDTOFull): void {
        this.logger.log(`registration ${JSON.stringify(res)}`);
        this.authService.registration(res);
    }

    @Post('/emailverification/:userId')
    emailverification(@Param('userId') userId: string, @Body() res: EmailVerificationModel): void {
        this.logger.log(`emailverification ${JSON.stringify(res)}`);
        this.authService.emailverification(userId, res);
    }

    @Post('/login')
    login(@Body() res: UserDTO): Promise<UserInfoTokenRO> {
        this.logger.log(`login ${JSON.stringify(res)}`);
        return this.authService.login(res);
    }



}
