import { IsString } from 'class-validator';

export class AuthDto {
	@IsString()
	public login: string;

	@IsString()
	public password: string;
}
