import {
	Body,
	Controller,
	HttpCode,
	HttpException,
	HttpStatus,
	Post,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { ALREADY_EXISTS_ERROR } from './auth.constants';
import { UserModel } from './user.model';

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
	async login(@Body() { login, password }: AuthDto): Promise<{ access_token: string }> {
		const { _id, email } = await this.authService.validateUser(login, password);
		return this.authService.login(_id.toString(), email);
	}
}
