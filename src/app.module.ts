import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoConfig } from './configs/mongo.config';
import { MusicModule } from './music/music.module';
import { FileModule } from './file/file.module';
import { PlaylistModule } from './playlist/playlist.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
	imports: [
		ConfigModule.forRoot(),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getMongoConfig,
		}),
		AuthModule,
		MusicModule,
		FileModule,
		PlaylistModule,
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'static/posters'),
			serveRoot: '/static/posters',
			exclude: ['/api*'],
		}),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
