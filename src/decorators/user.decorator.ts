import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Types } from 'mongoose';

export interface UserDecoratorPayload extends Express.User {}

export const User = createParamDecorator(
	(data: keyof UserDecoratorPayload, ctx: ExecutionContext) => {
		const req = ctx.switchToHttp().getRequest<Request>();
		const user = req.user as UserDecoratorPayload;
		console.log(user);
		return data ? user?.[data] : user;
	},
);
