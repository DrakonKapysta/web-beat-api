import {
	BadRequestException,
	HttpException,
	HttpStatus,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UserModel } from './user.model';
import { Document, Model } from 'mongoose';
import { compare, genSalt, hash } from 'bcrypt';
import { USER_NOT_FOUND_ERROR, WRONG_PASSWORD_ERROR } from './auth.constants';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
	constructor(
		@InjectModel('User') private readonly userModel: Model<UserModel>,
		private readonly jwtService: JwtService,
	) {}

	async createUser(dto: AuthDto, roles?: string[]): Promise<UserModel> {
		const salt = await genSalt(10);
		const passwordHash = await hash(dto.password, salt);
		const newUser = new this.userModel({
			email: dto.login,
			passwordHash,
			roles,
		});
		return newUser.save();
	}

	async findUser(email: string): Promise<UserModel | null> {
		return this.userModel.findOne({ email }).exec();
	}

	async validateUser(
		email: string,
		password: string,
	): Promise<Pick<UserModel, '_id' | 'email' | 'roles'>> {
		const user = await this.findUser(email);
		if (!user) throw new NotFoundException(USER_NOT_FOUND_ERROR);

		const isCorrectPassword = await compare(password, user.passwordHash);

		if (!isCorrectPassword) throw new UnauthorizedException(WRONG_PASSWORD_ERROR);

		return { _id: user._id, email: user.email, roles: user.roles };
	}

	async login(
		id: string,
		email: string,
		roles?: string[],
	): Promise<{ user: { id: string; email: string }; access_token: string }> {
		const payload = { id, email, roles };
		return {
			user: { id, email },
			access_token: await this.jwtService.signAsync(payload),
		};
	}
}
