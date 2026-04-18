import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AccountGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers['authorization'];

    const token = authHeader.split(' ')[1]; 
    try {
      const decodedToken = jwt.decode(token) as { current_account_id?: string }; 
      const currentAccountId = decodedToken?.current_account_id;
      if (currentAccountId) {
        request['current_account_id'] = currentAccountId;
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou não decodificável.');
    }
  }
}