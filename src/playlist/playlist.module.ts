import { Module } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { PlaylistController } from './playlist.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PlaylistSchema } from './playlist.model';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'Playlist', schema: PlaylistSchema }])],
	providers: [PlaylistService],
	controllers: [PlaylistController],
})
export class PlaylistModule {}
