import { Controller, Post, Logger, Body, Get, UseGuards, Delete, Param, Put, CacheInterceptor, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDTO, UserDTOFull, UserInfoTokenRO } from '../user/user.dto';
import { CodeVerificationModel } from '../model/mail.dto';

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

    @Post('/send-code-verification/:userId')
    sendCodeVerification(@Param('userId') userId: string): void {
        this.logger.log(`sendCodeVerification ${userId}`);
        this.authService.sendCodeVerification(userId);
    }

    @Post('/confirm-code-verification/:userId')
    confirmCodeVerification(@Param('userId') userId: string, @Body() res: CodeVerificationModel): void {
        this.logger.log(`confirmCodeVerification ${JSON.stringify(res)}`);
        this.authService.confirmCodeVerification(userId, res);
    }

    @Post('/login')
    login(@Body() res: UserDTO): Promise<UserInfoTokenRO> {
        this.logger.log(`login ${JSON.stringify(res)}`);
        return this.authService.login(res);
    }



}
