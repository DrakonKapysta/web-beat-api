import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpException,
	HttpStatus,
	Post,
	Res,
	UseGuards,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { ALREADY_EXISTS_ERROR } from './auth.constants';
import { UserModel } from './user.model';
import { Response } from 'express';
import { User } from 'src/decorators/user.decorator';
import { JwtCombineAuthGuard } from './guards/jwt.combine.guard';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@UsePipes(new ValidationPipe())
	@Post('register')
	async register(@Body() dto: AuthDto): Promise<{ id: string; email: string }> {
		const existedUser = await this.authService.findUser(dto.login);
		if (existedUser) throw new HttpException(ALREADY_EXISTS_ERROR, HttpStatus.BAD_REQUEST);
		const res = await this.authService.createUser(dto, ['user']);
		const user = { email: res.email, id: res._id.toString() };
		return user;
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('login')
	async login(
		@Body() { login, password }: AuthDto,
		@Res({ passthrough: true }) response: Response,
	): Promise<{ user: { id: string; email: string }; access_token: string }> {
		const { _id, email, roles } = await this.authService.validateUser(login, password);

		const res = await this.authService.login(_id.toString(), email, roles);
		response.cookie('access_token', res.access_token, {
			httpOnly: true,
			maxAge: 15 * 60 * 1000,
		});
		response.cookie('refresh_token', res.refresh_token, {
			httpOnly: true,
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		return res;
	}

	@Get('validate')
	@UseGuards(JwtCombineAuthGuard)
	async validate(@User() user: Express.User): Promise<Express.User> {
		return user;
	}

	@Get('refresh')
	@UseGuards(JwtCombineAuthGuard)
	async refresh(
		@User() user: Express.User,
		@Res({ passthrough: true }) response: Response,
	): Promise<{ access_token: string; refresh_token: string }> {
		const newTokens = await this.authService.refreshTokens(user.id, user.email, user.roles);

		response.cookie('access_token', newTokens.access_token, {
			httpOnly: true,
			maxAge: 15 * 60 * 1000,
		});

		response.cookie('refresh_token', newTokens.refresh_token, {
			httpOnly: true,
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		return newTokens;
	}
}
