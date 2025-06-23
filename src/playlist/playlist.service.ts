import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PlaylistDocument, PlaylistModel } from './playlist.model';
import { PlaylistRepository } from './playlist.repository';
import { PlaylistCreateDto } from './dto/playlist.create.dto';

@Injectable()
export class PlaylistService {
	constructor(private readonly playlistRepository: PlaylistRepository) {}

	async findAll(): Promise<PlaylistDocument[]> {
		return await this.playlistRepository.findAll();
	}

	async create(userId: string, createPlaylistDto: PlaylistCreateDto): Promise<PlaylistDocument> {
		const playlistData = {
			...createPlaylistDto,
			userId,
			tracks: [],
		};
		return await this.playlistRepository.create(playlistData);
	}
	async addTrack(
		playlistId: string,
		trackId: string,
		userId: string,
	): Promise<PlaylistDocument | null> {
		const playlist = await this.playlistRepository.findById(playlistId);
		if (!playlist) {
			throw new NotFoundException('Playlist not found');
		}

		if (playlist.userId.toString() !== userId) {
			throw new ForbiddenException('You can only modify your own playlists');
		}

		const trackExists = playlist.tracks.some((track) => track.trackId.toString() === trackId);

		if (trackExists) {
			throw new ForbiddenException('Track already exists in playlist');
		}

		return await this.playlistRepository.addTrack(playlistId, trackId);
	}

	async removeTrack(
		playlistId: string,
		trackId: string,
		userId: string,
	): Promise<PlaylistDocument | null> {
		const playlist = await this.playlistRepository.findById(playlistId);
		if (!playlist) {
			throw new NotFoundException('Playlist not found');
		}

		if (playlist.userId.toString() !== userId) {
			throw new ForbiddenException('You can only modify your own playlists');
		}

		return await this.playlistRepository.removeTrack(playlistId, trackId);
	}

	async findByUserId(userId: string): Promise<PlaylistDocument[]> {
		return await this.playlistRepository.findByUserId(userId);
	}

	async findById(id: string): Promise<PlaylistDocument | null> {
		return await this.playlistRepository.findById(id);
	}

	async findWithPagination(
		page: number = 1,
		limit: number = 10,
	): Promise<{ data: PlaylistDocument[]; total: number; page: number; totalPages: number }> {
		return await this.playlistRepository.findWithPagination(page, limit);
	}
}
