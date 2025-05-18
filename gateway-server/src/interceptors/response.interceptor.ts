// ######################## IMPORT ##########################
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  LoggerService,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

// ######################## LOGIC ###########################
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;
    const requestId = Date.now().toString();

    this.logger.log(`[${requestId}] Request: ${method} ${url}`);

    return next.handle().pipe(
      map((data) => ({
        statusCode: context.switchToHttp().getResponse().statusCode,
        data,
        timestamp: new Date().toISOString(),
      })),
      tap(() => {
        const delay = Date.now() - now;
        this.logger.log(
          `[${requestId}] Response: ${method} ${url} - ${delay}ms`,
        );
      }),
    );
  }
}
