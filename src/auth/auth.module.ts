import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserShema } from './user.model';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getJWTConfig } from './../configs/jwt.config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtCookieStrategy } from './strategies/jwt.cookie.strategy';
import { RefreshSchema } from './refresh.model';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'User', schema: UserShema },
			{ name: 'Refresh', schema: RefreshSchema },
		]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getJWTConfig,
		}),
		PassportModule,
		ConfigModule,
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, JwtCookieStrategy],
})
export class AuthModule {}
