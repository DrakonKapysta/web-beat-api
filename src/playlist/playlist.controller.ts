import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { PlaylistDocument } from './playlist.model';
import { PlaylistCreateDto } from './dto/playlist.create.dto';
import { JwtCombineAuthGuard } from 'src/auth/guards/jwt.combine.guard';
import { User } from 'src/decorators/user.decorator';

@Controller('playlist')
export class PlaylistController {
	constructor(private readonly playlistService: PlaylistService) {}

	@Get('search')
	@UseGuards(JwtCombineAuthGuard)
	async searchPlaylists(
		@Query('query') query: string,
		@User('id') userId: string,
	): Promise<PlaylistDocument[]> {
		return this.playlistService.searchPlaylists(query, userId);
	}

	@Get()
	async findAll(
		@Query('page', new ParseIntPipe({ optional: true })) page?: number,
		@Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
	): Promise<
		| { data: PlaylistDocument[]; total: number; page: number; totalPages: number }
		| PlaylistDocument[]
	> {
		const pageNum = page || 1;
		const limitNum = limit || 10;

		if (page || limit) {
			return this.playlistService.findWithPagination(pageNum, limitNum);
		}

		return this.playlistService.findAll();
	}

	@Get(':id')
	async findById(@Param('id') id: string): Promise<PlaylistDocument | null> {
		return this.playlistService.findById(id);
	}

	@Get('byUserId/:userId')
	async findByUserId(@Param('userId') userId: string): Promise<PlaylistDocument[]> {
		return this.playlistService.findByUserId(userId);
	}

	@Post()
	@UseGuards(JwtCombineAuthGuard)
	async createPlaylist(
		@Body() createPlaylistDto: PlaylistCreateDto,
		@User('id') userId: string,
	): Promise<PlaylistDocument> {
		return this.playlistService.create(userId, createPlaylistDto);
	}

	@Post(':id/tracks/:trackId')
	@UseGuards(JwtCombineAuthGuard)
	async addTrackToPlaylist(
		@Param('id') playlistId: string,
		@Param('trackId') trackId: string,
		@User('id') userId: string,
	): Promise<PlaylistDocument | null> {
		return this.playlistService.addTrack(playlistId, trackId, userId);
	}

	@Delete(':id/tracks/:trackId')
	@UseGuards(JwtCombineAuthGuard)
	async removeTrackFromPlaylist(
		@Param('id') playlistId: string,
		@Param('trackId') trackId: string,
		@User('id') userId: string,
	): Promise<PlaylistDocument | null> {
		return this.playlistService.removeTrack(playlistId, trackId, userId);
	}
}
