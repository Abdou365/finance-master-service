import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(public message: string) {} // Add a public message property

  intercept(context: ExecutionContext, next: CallHandler) {
    const statusCode = context.switchToHttp().getResponse().statusCode;

    return next
      .handle()
      .pipe(map((data) => ({ data, message: this.message, statusCode })));
  }
}
