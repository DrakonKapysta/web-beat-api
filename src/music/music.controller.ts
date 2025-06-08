import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	NotFoundException,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Query,
	Res,
	UploadedFile,
	UseInterceptors,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { MusicService } from './music.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSizeValidationPipe } from 'src/pipes/file-size-validation.pipe';
import { FileService } from 'src/file/file.service';
import { Response } from 'express';
import { UploadMusicDto } from './dto/upload-music.dto';
import { MusicDocument } from './music.model';

@Controller('music')
@UsePipes(new ValidationPipe())
export class MusicController {
	constructor(
		private readonly musicService: MusicService,
		private readonly fileService: FileService,
	) {}

	@Get('stream/:fileName')
	async streamMusic(@Param('fileName') fileName: string, @Res() res: Response): Promise<void> {
		await this.musicService.streamMusic(fileName, res);
	}

	@Get('search')
	async searchMusic(@Query('q') query: string): Promise<MusicDocument[]> {
		return await this.musicService.searchMusic(query);
	}

	@Get()
	async findAll(
		@Query('page', ParseIntPipe) page: number = 1,
		@Query('limit', ParseIntPipe) limit: number = 10,
	): Promise<
		MusicDocument[] | { data: MusicDocument[]; total: number; page: number; totalPages: number }
	> {
		if (page && limit) {
			return await this.musicService.findWithPagination(page, limit);
		}
		return await this.musicService.findAll();
	}

	@Get('statistics')
	async getStatistics(): Promise<{
		totalTracks: number;
		genreDistribution: Record<string, number>;
		topAuthors: {
			author: string;
			count: number;
		}[];
	}> {
		return await this.musicService.getStatistics();
	}

	@Post('upload')
	@UseInterceptors(FileInterceptor('file'))
	@HttpCode(201)
	async uploadMusic(
		@UploadedFile(new FileSizeValidationPipe()) file: Express.Multer.File,
		@Body() uploadMusicDto: UploadMusicDto,
	): Promise<MusicDocument> {
		if (!file) {
			throw new BadRequestException('File is required');
		}

		return await this.musicService.uploadMusic(file, uploadMusicDto);
	}

	@Get('author/:author')
	async findByAuthor(@Param('author') author: string): Promise<MusicDocument[]> {
		return await this.musicService.findByAuthor(author);
	}

	@Get('genre/:genre')
	async findByGenre(@Param('genre') genre: string): Promise<MusicDocument[]> {
		return await this.musicService.findByGenre(genre);
	}

	@Get('album/:album')
	async findByAlbum(@Param('album') album: string): Promise<MusicDocument[]> {
		return await this.musicService.findByAlbum(album);
	}

	@Get(':id')
	async findOne(@Param('id') id: string): Promise<MusicDocument> {
		return await this.musicService.findOne(id);
	}

	@Put(':id')
	async update(
		@Param('id') id: string,
		@Body() updateData: Partial<UploadMusicDto>,
	): Promise<MusicDocument> {
		return await this.musicService.update(id, updateData);
	}

	@Delete(':id')
	@HttpCode(200)
	async remove(@Param('id') id: string): Promise<{ id: string; message: string } | null> {
		const deletedTrack = await this.musicService.remove(id);
		if (!deletedTrack) {
			throw new NotFoundException('Track not found');
		}
		return { id: deletedTrack.id as string, message: 'Track deleted successfully' };
	}
}
