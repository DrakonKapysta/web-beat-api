import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserModel } from 'src/auth/user.model';
import { MusicDocument, MusicModel } from 'src/music/music.model';

@Injectable()
export class FavoriteRepository {
	constructor(
		@InjectModel('User') private readonly userModel: Model<UserModel>,
		@InjectModel('Music') private readonly musicModel: Model<MusicModel>,
	) {}

	async getFavoritesByUserId(userId: string): Promise<MusicDocument[]> {
		const user = await this.userModel.findById(userId).populate('likedTracks').exec();

		if (!user) {
			return [];
		}

		return user.likedTracks as unknown as MusicDocument[];
	}

	async addToFavorites(userId: string, musicId: string): Promise<string> {
		const music = await this.musicModel.findById(musicId).exec();
		if (!music) {
			throw new Error('Music not found');
		}

		const musicObjectId = new Types.ObjectId(musicId);

		const result = await this.userModel
			.findByIdAndUpdate(
				userId,
				{
					$addToSet: { likedTracks: musicObjectId },
				},
				{ new: true },
			)
			.exec();

		if (!result) {
			throw new Error('User not found');
		}

		return musicId;
	}

	async removeFromFavorites(userId: string, musicId: string): Promise<string> {
		const musicObjectId = new Types.ObjectId(musicId);

		const result = await this.userModel
			.findByIdAndUpdate(
				userId,
				{
					$pull: { likedTracks: musicObjectId },
				},
				{ new: true },
			)
			.exec();

		if (!result) {
			throw new Error('User not found');
		}

		return musicId;
	}

	async isTrackInFavorites(userId: string, musicId: string): Promise<boolean> {
		const musicObjectId = new Types.ObjectId(musicId);

		const user = await this.userModel
			.findOne({
				_id: userId,
				likedTracks: musicObjectId,
			})
			.exec();

		return !!user;
	}
}
