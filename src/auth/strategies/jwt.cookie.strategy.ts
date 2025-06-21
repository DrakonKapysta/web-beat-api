import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { UserModel } from '../user.model';
import { Request } from 'express';

@Injectable()
export class JwtCookieStrategy extends PassportStrategy(Strategy, 'jwt-cookie') {
	constructor(private readonly configService: ConfigService) {
		super({
			jwtFromRequest: (req: Request) => {
				if (req.cookies && req.cookies.access_token) {
					return req.cookies.access_token;
				}
				return null;
			},
			ignoreExpiration: false,
			secretOrKey: configService.get('JWT_SECRET') || 'secret',
		});
	}

	async validate(payload: Pick<UserModel, '_id' | 'email'>): Promise<any> {
		return payload;
	}
}
