import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { UserModel } from '../user.model';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';

interface AuthCookies {
	access_token?: string;
	refresh_token?: string;
}

@Injectable()
export class JwtCookieStrategy extends PassportStrategy(Strategy, 'jwt-cookie') {
	constructor(
		private readonly configService: ConfigService,
		private readonly authService: AuthService,
		private readonly jwtService: JwtService,
	) {
		super({
			jwtFromRequest: (req: Request) => {
				return null;
			},
			ignoreExpiration: true,
			secretOrKey: configService.get('JWT_SECRET') || 'secret',
			passReqToCallback: true,
		});
	}

	async validate(req: Request & { cookies?: AuthCookies }): Promise<any> {
		const access_token: string | undefined = req.cookies?.access_token;
		const refresh_token: string | undefined = req.cookies?.refresh_token;
		if (!access_token) {
			throw new UnauthorizedException('Access token not found');
		}
		try {
			const decoded = await this.jwtService.verifyAsync(access_token);
			return decoded;
		} catch (error) {
			if (refresh_token) {
				try {
					const refreshDecoded: { id: string; email: string; roles: string[] } =
						await this.jwtService.verifyAsync(refresh_token, {
							secret: this.configService.get('JWT_REFRESH_SECRET'),
						});

					const storedRefreshToken = await this.authService.findRefreshToken(refresh_token);
					if (!storedRefreshToken) {
						throw new UnauthorizedException('Invalid refresh token');
					}

					const newTokens = await this.authService.refreshTokens(
						refreshDecoded.id,
						refreshDecoded.email,
						refreshDecoded.roles,
					);

					req.res?.cookie('access_token', newTokens.access_token, {
						httpOnly: true,
						maxAge: 15 * 60 * 1000,
					});

					req.res?.cookie('refresh_token', newTokens.refresh_token, {
						httpOnly: true,
						maxAge: 7 * 24 * 60 * 60 * 1000,
					});
					return refreshDecoded;
				} catch (refreshError) {
					throw new UnauthorizedException('Invalid refresh token');
				}
			}
			throw new UnauthorizedException('Access token expired and no refresh token provided');
		}
	}
}
