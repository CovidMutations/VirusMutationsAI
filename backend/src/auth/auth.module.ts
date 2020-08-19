import { Module } from '@nestjs/common';
// import { AuthResolver } from './Auth.resolver';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthController],
  exports: [AuthService]
})
export class AuthModule {


}
