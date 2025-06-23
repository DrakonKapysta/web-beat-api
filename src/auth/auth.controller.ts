import {
	Body,
	Controller,
	HttpCode,
	HttpException,
	HttpStatus,
	Post,
	Res,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { ALREADY_EXISTS_ERROR } from './auth.constants';
import { UserModel } from './user.model';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@UsePipes(new ValidationPipe())
	@Post('register')
	async register(@Body() dto: AuthDto): Promise<UserModel> {
		const existedUser = await this.authService.findUser(dto.login);
		if (existedUser) throw new HttpException(ALREADY_EXISTS_ERROR, HttpStatus.BAD_REQUEST);
		return this.authService.createUser(dto);
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('login')
	async login(
		@Body() { login, password }: AuthDto,
		@Res({ passthrough: true }) response: Response,
	): Promise<{ access_token: string }> {
		const { _id, email } = await this.authService.validateUser(login, password);

		const { access_token } = await this.authService.login(_id.toString(), email);

		response.cookie('access_token', access_token, {
			httpOnly: true,
		});

		return { access_token };
	}
}
