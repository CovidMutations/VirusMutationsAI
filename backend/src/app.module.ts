import { Module, CacheModule } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE, APP_FILTER } from '@nestjs/core';
// import { GqlHttpExceptionFilter } from './shared/gql-http-error.filter';
import { HttpErrorFilter } from './shared/http-error.filter';
import { LoggingInterceptor } from './shared/logging.interceptor';
import { ValidationPipe } from './shared/validation.pipe';
// import { GraphQLModule } from '@nestjs/graphql';

import { MutationAnnotationModule } from './mutation-annotation/mutation-annotation.module';
import { AdminModule } from './admin/admin.module';


@Module({
  imports: [
    CacheModule.register(),
    MutationAnnotationModule,
    AdminModule,
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
  ],
})
export class AppModule {}
