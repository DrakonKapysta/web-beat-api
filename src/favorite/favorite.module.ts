import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';
import { FavoriteRepository } from './favorite.repository';
import { UserShema } from 'src/auth/user.model';
import { MusicSchema } from 'src/music/music.model';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'User', schema: UserShema },
			{ name: 'Music', schema: MusicSchema },
		]),
	],
	providers: [FavoriteService, FavoriteRepository],
	controllers: [FavoriteController],
	exports: [FavoriteService, FavoriteRepository],
})
export class FavoriteModule {}
