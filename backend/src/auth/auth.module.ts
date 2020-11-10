import { Module } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as config from 'config';
const jwtConfig = config.get('jwt');
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserRepository } from '../user/user.repository';
import { MailModule } from '../mail/mail.module';
import { MailService } from '../mail/mail.service';


const ACCESS_TOKEN_EXPIRE_MINUTES = 60;

@Module({
  imports: [
    UserModule,
    MailModule,
    TypeOrmModule.forFeature([UserRepository]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: { expiresIn: ACCESS_TOKEN_EXPIRE_MINUTES * 60 },
    }),
  ],
  controllers: [AuthController],
  providers: [ JwtStrategy, AuthService, MailService],
  exports: [AuthService],
})
export class AuthModule {}
