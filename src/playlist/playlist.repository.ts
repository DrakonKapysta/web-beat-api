import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlaylistDocument, PlaylistModel } from './playlist.model';
import { PlaylistCreateDto } from './dto/playlist.create.dto';

@Injectable()
export class PlaylistRepository {
	constructor(@InjectModel('Playlist') private readonly playlistModel: Model<PlaylistModel>) {}

	async create(playlistData: PlaylistCreateDto & { userId: string }): Promise<PlaylistDocument> {
		const createdPlaylist = new this.playlistModel(playlistData);
		return createdPlaylist.save();
	}

	async findAll(): Promise<PlaylistDocument[]> {
		return this.playlistModel.find({}).populate('tracks.trackId').exec();
	}

	async findWithPagination(
		page: number,
		limit: number,
	): Promise<{ data: PlaylistDocument[]; total: number; page: number; totalPages: number }> {
		const skip = (page - 1) * limit;
		const [data, total] = await Promise.all([
			this.playlistModel.find({}).skip(skip).limit(limit).populate('tracks.trackId').exec(),
			this.playlistModel.countDocuments({}).exec(),
		]);
		return {
			data,
			total,
			page,
			totalPages: Math.ceil(total / limit),
		};
	}

	async findById(id: string): Promise<PlaylistDocument | null> {
		return this.playlistModel.findById(id).populate('tracks.trackId').exec();
	}

	async findByUserId(userId: string): Promise<PlaylistDocument[]> {
		return this.playlistModel.find({ userId }).populate('tracks.trackId').exec();
	}

	async addTrack(playlistId: string, trackId: string): Promise<PlaylistDocument | null> {
		return await this.playlistModel
			.findByIdAndUpdate(
				playlistId,
				{
					$push: {
						tracks: {
							trackId,
							addedAt: new Date(),
						},
					},
				},
				{ new: true },
			)
			.exec();
	}
	async removeTrack(playlistId: string, trackId: string): Promise<PlaylistDocument | null> {
		return await this.playlistModel
			.findByIdAndUpdate(
				playlistId,
				{
					$pull: {
						tracks: { trackId },
					},
				},
				{ new: true },
			)
			.exec();
	}
}
