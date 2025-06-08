import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MusicRepository } from './music.repository';
import { FileService } from 'src/file/file.service';
import { UploadMusicDto } from './dto/upload-music.dto';
import { MusicDocument } from './music.model';
import { Response } from 'express';

@Injectable()
export class MusicService {
	constructor(
		private readonly musicRepository: MusicRepository,
		private readonly fileService: FileService,
	) {}

	async streamMusic(fileName: string, res: Response): Promise<void> {
		try {
			await this.fileService.streamFile(fileName, res);
		} catch (error) {
			console.error('Error streaming music file:', error);
			throw new NotFoundException(`Music file ${fileName} not found`);
		}
	}

	async uploadMusic(
		file: Express.Multer.File,
		uploadMusicDto: UploadMusicDto,
	): Promise<MusicDocument> {
		const filePath = await this.fileService.saveFile(file.originalname, file.buffer);

		const musicData = {
			fileName: file.originalname,
			author: uploadMusicDto.author,
			album: uploadMusicDto.album,
			genre: uploadMusicDto.genre,
			year: uploadMusicDto.year,
			posterUrl: uploadMusicDto.posterUrl,
			filePath: filePath,
			metadata: uploadMusicDto.metadata || {},
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

	async remove(id: string): Promise<MusicDocument | null> {
		const music = await this.musicRepository.findById(id);
		if (!music) {
			throw new NotFoundException(`Music with ID ${id} not found`);
		}
		try {
			await this.fileService.deleteFile(music.fileName);
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
