import { Module, CacheModule } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE, APP_FILTER } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
// import { GqlHttpExceptionFilter } from './shared/gql-http-error.filter';
import { HttpErrorFilter } from './shared/http-error.filter';
import { LoggingInterceptor } from './shared/logging.interceptor';
import { ValidationPipe } from './shared/validation.pipe';
// import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { MutationAnnotationModule } from './mutation-annotation/mutation-annotation.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';

 import { TasksService } from './services/tasks.service';



@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname),
    }),
    CacheModule.register(),
    ScheduleModule.forRoot(),
    MutationAnnotationModule,
    AdminModule,
    AuthModule
    // GraphQLModule.forRoot({
    //   installSubscriptionHandlers: true,
    //   typePaths: ['./**/*.graphql'],
    //   context: ({req}) => ({ req }),
    //   debug: true,
    //   playground: true,
    // }),
    
  ],
  controllers: [],
  providers: [
    {provide: APP_FILTER, useClass: HttpErrorFilter },
 //   {provide: 'APP_FILTER_GQL', useClass: GqlHttpExceptionFilter },
    {provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    {provide: APP_PIPE, useClass: ValidationPipe },
     TasksService
  ],
})
export class AppModule {
}
