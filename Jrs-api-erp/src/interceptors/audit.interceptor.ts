import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Adicionar dados de auditoria ao request
    request.auditData = {
      userId: request.user?.user_id,
      accountId: request.user?.current_account_id,
      ipAddress: request.ip || request.connection?.remoteAddress,
      userAgent: request.get('user-agent'),
    };

    return next.handle();
  }
}
