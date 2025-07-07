import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MusicDocument, MusicModel } from './music.model';
import { Model, MongooseBaseQueryOptionKeys, QueryOptions } from 'mongoose';

@Injectable()
export class MusicRepository {
	constructor(@InjectModel('Music') private readonly musicModel: Model<MusicModel>) {}
	async create(musicData: MusicModel): Promise<MusicDocument> {
		const createdMusic = new this.musicModel(musicData);
		return createdMusic.save();
	}

	async countDocuments(options?: any): Promise<number> {
		return this.musicModel.countDocuments(options).exec();
	}
	async findAll(): Promise<MusicDocument[]> {
		return this.musicModel.find().sort({ createdAt: -1 }).exec();
	}

	async findById(id: string): Promise<MusicDocument | null> {
		return this.musicModel.findById(id).exec();
	}

	async findByHash(hash: string): Promise<MusicDocument | null> {
		return this.musicModel.findOne({ fileHash: hash }).exec();
	}

	async findByAuthor(author: string): Promise<MusicDocument[]> {
		return this.musicModel
			.find({ author: { $regex: author, $options: 'i' } })
			.sort({ createdAt: -1 })
			.exec();
	}

	async findByGenre(genre: string): Promise<MusicDocument[]> {
		return this.musicModel.find({ genre }).sort({ createdAt: -1 }).exec();
	}

	async findByAlbum(album: string): Promise<MusicDocument[]> {
		return this.musicModel
			.find({ album: { $regex: album, $options: 'i' } })
			.sort({ createdAt: -1 })
			.exec();
	}

	async search(query: string): Promise<MusicDocument[]> {
		return this.musicModel
			.find({
				$or: [
					{ author: { $regex: query, $options: 'i' } },
					{ album: { $regex: query, $options: 'i' } },
					{ title: { $regex: query, $options: 'i' } },
					{ genre: { $regex: query, $options: 'i' } },
				],
			})
			.sort({ createdAt: -1 })
			.exec();
	}

	async updateById(id: string, updateData: Partial<MusicModel>): Promise<MusicDocument | null> {
		return this.musicModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
	}

	async deleteById(id: string): Promise<MusicDocument | null> {
		return this.musicModel.findByIdAndDelete(id).exec();
	}

	async countByAuthor(author: string): Promise<number> {
		return this.musicModel.countDocuments({ author }).exec();
	}

	async countByGenre(genre: string): Promise<number> {
		return this.musicModel.countDocuments({ genre }).exec();
	}

	async findWithPagination(
		page: number = 1,
		limit: number = 10,
	): Promise<{ data: MusicDocument[]; total: number; page: number; totalPages: number }> {
		const skip = (page - 1) * limit;

		const [data, total] = await Promise.all([
			this.musicModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
			this.musicModel.countDocuments().exec(),
		]);

		return {
			data,
			total,
			page,
			totalPages: Math.ceil(total / limit),
		};
	}
}
