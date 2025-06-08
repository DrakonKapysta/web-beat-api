import { Module } from '@nestjs/common';
import { MusicService } from './music.service';
import { MusicController } from './music.controller';
import { FileModule } from 'src/file/file.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MusicModel, MusicSchema } from './music.model';
import { MusicRepository } from './music.repository';

@Module({
	imports: [FileModule, MongooseModule.forFeature([{ name: 'Music', schema: MusicSchema }])],
	providers: [MusicService, MusicRepository],
	controllers: [MusicController],
	exports: [MusicService, MusicRepository],
})
export class MusicModule {}
