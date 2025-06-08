import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Types } from 'mongoose';

export interface UserDecoratorPayload extends Express.User {
	_id: Types.ObjectId;
	email: string;
}

export const User = createParamDecorator(
	(data: keyof UserDecoratorPayload, ctx: ExecutionContext) => {
		const req = ctx.switchToHttp().getRequest<Request>();
		const user = req.user as UserDecoratorPayload;
		return data ? user?.[data] : user;
	},
);
