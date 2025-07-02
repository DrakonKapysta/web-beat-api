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
	UploadedFiles,
	UseGuards,
	UseInterceptors,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { MusicService } from './music.service';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { FileSizeValidationPipe } from 'src/pipes/file-size-validation.pipe';
import { FileService } from 'src/file/file.service';
import { Request, Response } from 'express';
import { UploadMusicDto } from './dto/upload-music.dto';
import { MusicDocument } from './music.model';
import { JwtCombineAuthGuard } from 'src/auth/guards/jwt.combine.guard';
import { diskStorage, Multer } from 'multer';
import { extname } from 'path';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('music')
@UsePipes(new ValidationPipe())
export class MusicController {
	constructor(
		private readonly musicService: MusicService,
		private readonly fileService: FileService,
	) {}

	@Get('stream/:hash')
	async streamMusic(@Param('hash') hash: string, @Res() res: Response): Promise<void> {
		await this.musicService.streamMusic(hash, res);
	}

	@Get('search')
	async searchMusic(@Query('q') query: string): Promise<MusicDocument[]> {
		return await this.musicService.searchMusic(query);
	}

	@Get()
	@Roles(['user'])
	@UseGuards(JwtCombineAuthGuard, RolesGuard)
	async findAll(
		@Query('page', new ParseIntPipe({ optional: true })) page?: number,
		@Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
	): Promise<
		MusicDocument[] | { data: MusicDocument[]; total: number; page: number; totalPages: number }
	> {
		const pageNum = page || 1;
		const limitNum = limit || 10;

		if (page || limit) {
			return await this.musicService.findWithPagination(pageNum, limitNum);
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
	@UseGuards(JwtCombineAuthGuard)
	@UseInterceptors(
		FileFieldsInterceptor(
			[
				{ name: 'music', maxCount: 1 },
				{ name: 'poster', maxCount: 1 },
			],
			{
				storage: diskStorage({
					destination: (req: Request, file: Express.Multer.File, callback) => {
						if (file.fieldname === 'music') {
							callback(null, 'uploads/music');
						} else if (file.fieldname === 'poster') {
							callback(null, 'static/posters');
						}
					},
					filename: (req: Request, file: Express.Multer.File, callback) => {
						const timestamp = Date.now();
						const ext = extname(file.originalname);
						callback(null, `${file.fieldname}_${timestamp}${ext}`);
					},
				}),
				fileFilter: (req: Request, file: Express.Multer.File, callback) => {
					if (file.fieldname === 'music' && file.mimetype.startsWith('audio/')) {
						callback(null, true);
					} else if (file.fieldname === 'poster' && file.mimetype.startsWith('image/')) {
						callback(null, true);
					} else {
						callback(new Error('Invalid file type for field'), false);
					}
				},
			},
		),
	)
	@HttpCode(201)
	async uploadMusic(
		@UploadedFiles() files: { music?: Express.Multer.File[]; poster?: Express.Multer.File[] },
		@Body() uploadMusicDto: UploadMusicDto,
	): Promise<MusicDocument> {
		if (!files.music || files.music.length === 0) {
			throw new BadRequestException('Music file is required');
		}

		const musicFile = files.music[0];
		const posterFile = files.poster?.[0];

		return await this.musicService.uploadMusic(musicFile, posterFile, uploadMusicDto);
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
	@UseGuards(JwtCombineAuthGuard)
	async update(
		@Param('id') id: string,
		@Body() updateData: Partial<UploadMusicDto>,
	): Promise<MusicDocument> {
		return await this.musicService.update(id, updateData);
	}

	@Delete(':id')
	@UseGuards(JwtCombineAuthGuard)
	@HttpCode(200)
	async remove(@Param('id') id: string): Promise<{ id: string; message: string } | null> {
		const deletedTrack = await this.musicService.deleteMusic(id);
		if (!deletedTrack) {
			throw new NotFoundException('Track not found');
		}
		return { id: deletedTrack.id as string, message: 'Track deleted successfully' };
	}
}
