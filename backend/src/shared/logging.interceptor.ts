
import { Injectable, NestInterceptor, ExecutionContext, Logger, CallHandler } from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    call$: CallHandler<any>,
  ): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const now = Date.now();
    if (req) {
      const method = req.method;
      const url = req.url;

      return call$.handle()
      .pipe(
        tap(() => Logger.log(
            `${method} ${url} ${Date.now() - now}ms`,
            context.getClass().name
          ),
        ),
      );
    } else {

      const ctx: any = GqlExecutionContext.create(context);
      const resolverName = ctx.constructorRef.name;
      const info = ctx.getInfo();

      return call$.handle()
      .pipe(
        tap(() => Logger.log(
            `${info.parentType} ${info.fieldName} ${Date.now() - now}ms`,
            resolverName,
          ),
        ),
      );
    }
  }
}
