import { Module } from '@nestjs/common';
// import { AdminResolver } from './admin.resolver';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AdminController],
  exports: [AdminService]
})
export class AdminModule {


}
