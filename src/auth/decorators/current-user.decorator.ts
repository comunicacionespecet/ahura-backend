import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PayloadToken } from '../models/token.model';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PayloadToken | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as PayloadToken | undefined;
  },
);
