import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentAccountId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request['current_account_id'];
  },
);