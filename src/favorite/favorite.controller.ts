import {
	BadRequestException,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Query,
} from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { MusicDocument } from 'src/music/music.model';

@Controller('favorite')
export class FavoriteController {
	constructor(private readonly favoriteService: FavoriteService) {}

	@Get(':id')
	async getByUserId(
		@Param('id') userId: string,
		@Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
		@Query('page', new ParseIntPipe({ optional: true })) page?: number,
	): Promise<MusicDocument[]> {
		if (!userId) {
			throw new BadRequestException('User ID is required');
		}

		const pageNum = page || 1;
		const limitNum = limit || 10;

		if (page || limit) {
			return [];
		}
		return this.favoriteService.getFavoritesByUserId(userId);
	}

	@Post('add/:id')
	async addToFavorites(
		@Param('id') userId: string,
		@Query('musicId') musicId: string,
	): Promise<string> {
		if (!userId || !musicId) {
			throw new BadRequestException('User ID and Music ID are required');
		}
		return this.favoriteService.addToFavorites(userId, musicId);
	}

	@Delete('remove/:id')
	async removeFromFavorites(
		@Param('id') userId: string,
		@Query('musicId') musicId: string,
	): Promise<string> {
		if (!userId || !musicId) {
			throw new BadRequestException('User ID and Music ID are required');
		}
		return this.favoriteService.removeFromFavorites(userId, musicId);
	}
}
