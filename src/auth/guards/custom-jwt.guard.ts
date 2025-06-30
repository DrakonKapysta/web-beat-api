import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

interface JwtPayload {
	id: string;
	email: string;
	iat?: number;
	exp?: number;
}

@Injectable()
export class CustomJwtGuard implements CanActivate {
	constructor(private readonly jwtService: JwtService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();

		// 1. Извлекаем токен из разных источников
		const token = this.extractTokenFromRequest(request);

		if (!token) {
			throw new UnauthorizedException('Token not found');
		}

		try {
			// 2. Проверяем и декодируем токен
			const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

			// 3. Помещаем данные пользователя в request
			(request as any).user = payload;

			return true; // Пропускаем запрос
		} catch (error) {
			throw new UnauthorizedException('Invalid token');
		}
	}

	private extractTokenFromRequest(request: Request): string | null {
		// Пробуем найти токен в разных местах

		// 1. Ищем в Authorization header (Bearer token)
		const authHeader = request.headers.authorization;
		if (authHeader && authHeader.startsWith('Bearer ')) {
			return authHeader.substring(7); // Убираем "Bearer "
		}

		// 2. Ищем в cookies
		if (request.cookies && request.cookies.access_token) {
			return request.cookies.access_token as string;
		}

		return null;
	}
}
