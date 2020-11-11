import { Controller, Post, Logger, Body, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDTOFull } from '../user/user.dto';
import { OAuth2PasswordRequestDTO, Token } from './auth.dto';

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

    @Get('/confirm-code-verification/:userId/:code')
    confirmCodeVerification(@Param('userId') userId: string, @Param('code') code: string): void {
        this.logger.log(`confirmCodeVerification ${JSON.stringify(code)}`);
        this.authService.confirmCodeVerification(userId, code);
    }

    @Post('/login')
    login(@Body() res: OAuth2PasswordRequestDTO): Promise<Token> {
        return this.authService.login(res);
    }
}
