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
import { ConfigService } from '@nestjs/config';
import { RefreshModel } from './refresh.model';

@Injectable()
export class AuthService {
	constructor(
		@InjectModel('User') private readonly userModel: Model<UserModel>,
		@InjectModel('Refresh') private readonly refreshModel: Model<RefreshModel>,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
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
	): Promise<{ user: { id: string; email: string }; access_token: string; refresh_token: string }> {
		const payload = { id, email, roles };

		const access_token = await this.jwtService.signAsync(payload, {
			expiresIn: '15m',
		});

		const refresh_token = await this.jwtService.signAsync(payload, {
			secret: this.configService.get('JWT_REFRESH_SECRET'),
			expiresIn: '7d',
		});

		await this.saveRefreshToken(id, refresh_token);

		return {
			user: { id, email },
			access_token,
			refresh_token,
		};
	}

	async generateRefreshToken(id: string, email: string, roles?: string[]): Promise<string> {
		const payload = { id, email, roles };
		const refresh_token = await this.jwtService.signAsync(payload, {
			secret: this.configService.get('JWT_REFRESH_SECRET'),
			expiresIn: '7d',
		});
		await this.saveRefreshToken(id, refresh_token);

		return refresh_token;
	}

	async refreshTokens(
		id: string,
		email: string,
		roles?: string[],
	): Promise<{ access_token: string; refresh_token: string }> {
		const payload = { id, email, roles };

		const access_token = await this.jwtService.signAsync(payload, {
			expiresIn: '15m',
		});

		const refresh_token = await this.jwtService.signAsync(payload, {
			secret: this.configService.get('JWT_REFRESH_SECRET'),
			expiresIn: '7d',
		});

		await this.updateRefreshToken(id, refresh_token);

		return {
			access_token,
			refresh_token,
		};
	}

	async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
		await this.refreshModel.deleteMany({ userId });
		const newRefreshToken = new this.refreshModel({
			refreshToken,
			userId,
		});

		await newRefreshToken.save();
	}
	private async updateRefreshToken(userId: string, newRefreshToken: string): Promise<void> {
		await this.refreshModel.findOneAndUpdate(
			{ userId },
			{ refreshToken: newRefreshToken },
			{ upsert: true },
		);
	}

	async findRefreshToken(refreshToken: string): Promise<RefreshModel | null> {
		return this.refreshModel.findOne({ refreshToken }).exec();
	}

	async removeRefreshToken(refreshToken: string): Promise<void> {
		await this.refreshModel.deleteOne({ refreshToken });
	}

	async logout(userId: string): Promise<void> {
		await this.refreshModel.deleteMany({ userId });
	}
}
