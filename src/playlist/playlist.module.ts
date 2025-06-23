import { Module } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { PlaylistController } from './playlist.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PlaylistSchema } from './playlist.model';
import { PlaylistRepository } from './playlist.repository';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'Playlist', schema: PlaylistSchema }])],
	providers: [PlaylistService, PlaylistRepository],
	controllers: [PlaylistController],
	exports: [PlaylistService, PlaylistRepository],
})
export class PlaylistModule {}
