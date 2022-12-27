import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetUserIdDecorator = createParamDecorator(
  (data: undefined, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest();
    return request.user['sub'];
  },
);
