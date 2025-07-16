import { Injectable } from '@nestjs/common';
import { MusicDocument } from 'src/music/music.model';
import { FavoriteRepository } from './favorite.repository';

@Injectable()
export class FavoriteService {
	constructor(private readonly favoriteRepository: FavoriteRepository) {}

	async getFavoritesByUserId(userId: string): Promise<MusicDocument[]> {
		return this.favoriteRepository.getFavoritesByUserId(userId);
	}

	async addToFavorites(userId: string, musicId: string): Promise<string> {
		return this.favoriteRepository.addToFavorites(userId, musicId);
	}

	async removeFromFavorites(userId: string, musicId: string): Promise<string> {
		return this.favoriteRepository.removeFromFavorites(userId, musicId);
	}
}
