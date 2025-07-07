import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { MusicRepository } from './music.repository';
import { FileService } from 'src/file/file.service';
import { UploadMusicDto } from './dto/upload-music.dto';
import { MusicDocument } from './music.model';
import { Response } from 'express';
import path, { extname, basename } from 'path';
import { readFileSync, unlinkSync, renameSync, existsSync } from 'fs-extra';
import * as crypto from 'crypto';
import { IAudioMetadata, parseBuffer, parseFile } from 'music-metadata';

@Injectable()
export class MusicService {
	constructor(
		private readonly musicRepository: MusicRepository,
		private readonly fileService: FileService,
	) {}

	async streamMusic(hash: string, res: Response): Promise<void> {
		try {
			await this.fileService.streamFile(hash, res);
		} catch (error) {
			console.error('Error streaming music file:', error);
			throw new NotFoundException(`Music file ${hash} not found`);
		}
	}

	private async calculateFileHash(filePath: string): Promise<string> {
		const fileBuffer = readFileSync(filePath);
		return crypto.createHash('md5').update(fileBuffer).digest('hex');
	}

	async uploadMusic(
		musicFile: Express.Multer.File,
		posterFile: Express.Multer.File | undefined,
		uploadMusicDto: UploadMusicDto,
	): Promise<MusicDocument> {
		const fileHash = await this.calculateFileHash(musicFile.path);
		const existingMusic = await this.musicRepository.findByHash(fileHash);

		if (existingMusic) {
			unlinkSync(musicFile.path);
			if (posterFile) {
				unlinkSync(posterFile.path);
			}

			throw new ConflictException('This file already exists in the system');
		}

		const ext = extname(musicFile.originalname);
		const newMusicPath = `./uploads/music/${fileHash}${ext}`;

		renameSync(musicFile.path, newMusicPath);

		let newPosterPath: string | null = null;

		if (posterFile) {
			const posterExt = extname(posterFile.originalname);
			newPosterPath = `./static/posters/${fileHash}${posterExt}`;
			renameSync(posterFile.path, newPosterPath);
		}

		const meta = await parseFile(newMusicPath);

		const musicData = {
			...uploadMusicDto,
			posterUrl: posterFile ? newPosterPath : null,
			filePath: newMusicPath,
			fileHash,
			metadata: {
				...uploadMusicDto.metadata,
				extension: extname(musicFile.originalname).slice(1),
				duration: meta?.format.duration || 0,
				originalName: musicFile.originalname,
				mimeType: musicFile.mimetype,
				fileSize: musicFile.size,
			},
		};

		return await this.musicRepository.create(musicData);
	}

	async findAll(): Promise<MusicDocument[]> {
		return await this.musicRepository.findAll();
	}

	async findOne(id: string): Promise<MusicDocument> {
		const music = await this.musicRepository.findById(id);
		if (!music) {
			throw new NotFoundException(`Music with ID ${id} not found`);
		}
		return music;
	}

	async findByAuthor(author: string): Promise<MusicDocument[]> {
		return await this.musicRepository.findByAuthor(author);
	}

	async findByGenre(genre: string): Promise<MusicDocument[]> {
		return await this.musicRepository.findByGenre(genre);
	}

	async findByAlbum(album: string): Promise<MusicDocument[]> {
		return await this.musicRepository.findByAlbum(album);
	}

	async searchMusic(query: string): Promise<MusicDocument[]> {
		if (!query || query.trim().length === 0) {
			throw new BadRequestException('Search query cannot be empty');
		}
		return await this.musicRepository.search(query);
	}

	async findWithPagination(
		page: number = 1,
		limit: number = 10,
	): Promise<{ data: MusicDocument[]; total: number; page: number; totalPages: number }> {
		return await this.musicRepository.findWithPagination(page, limit);
	}

	async update(id: string, updateData: Partial<UploadMusicDto>): Promise<MusicDocument> {
		const updatedMusic = await this.musicRepository.updateById(id, updateData);
		if (!updatedMusic) {
			throw new NotFoundException(`Music with ID ${id} not found`);
		}
		return updatedMusic;
	}

	async deleteMusic(id: string): Promise<MusicDocument | null> {
		const music = await this.musicRepository.findById(id);
		if (!music) {
			throw new NotFoundException(`Music with ID ${id} not found`);
		}
		const musicUsingFile = await this.musicRepository.countDocuments({
			filePath: music.filePath,
			_id: { $ne: id },
		});
		const musicUsingPoster = music.posterUrl
			? await this.musicRepository.countDocuments({
					posterUrl: music.posterUrl,
					_id: { $ne: id },
				})
			: 0;
		try {
			if (musicUsingFile === 0 && existsSync(music.filePath)) {
				unlinkSync(music.filePath);
			}

			if (musicUsingPoster === 0 && music.posterUrl) {
				const posterPath = `./static/posters/${basename(music.posterUrl)}`;
				if (existsSync(posterPath)) {
					unlinkSync(posterPath);
				}
			}
		} catch (error) {
			console.error('Error deleting file:', error);
		}
		return await this.musicRepository.deleteById(id);
	}

	async getStatistics(): Promise<{
		totalTracks: number;
		genreDistribution: Record<string, number>;
		topAuthors: { author: string; count: number }[];
	}> {
		try {
			const allMusic = await this.musicRepository.findAll();

			const genreStats = allMusic.reduce(
				(acc, music) => {
					acc[music.genre] = (acc[music.genre] || 0) + 1;
					return acc;
				},
				{} as Record<string, number>,
			);

			const authorStats = allMusic.reduce(
				(acc, music) => {
					acc[music.author] = (acc[music.author] || 0) + 1;
					return acc;
				},
				{} as Record<string, number>,
			);

			return {
				totalTracks: allMusic.length,
				genreDistribution: genreStats,
				topAuthors: Object.entries(authorStats)
					.sort(([, a], [, b]) => b - a)
					.slice(0, 10)
					.map(([author, count]) => ({ author, count })),
			};
		} catch (error) {
			console.error('Error fetching statistics:', error);
			throw new BadRequestException('Failed to fetch music statistics');
		}
	}
}
