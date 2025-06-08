import {
	IsIn,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsObject,
	IsOptional,
	IsString,
	IsUrl,
	Length,
	Matches,
	Max,
	Min,
} from 'class-validator';
import { GENRES } from '../constants/genres.constant';
import { Transform, Type } from 'class-transformer';

export class UploadMusicDto {
	@IsString({ message: 'File name must be a string' })
	@IsNotEmpty({ message: 'File name cannot be empty' })
	@Length(1, 100, { message: 'File name must be between 1 and 100 characters' })
	@Matches(/^[^<>:"/\\|?*]+\.(mp3|wav|flac|m4a|aac)$/i, {
		message: 'Invalid file name format or extension (supported: mp3, wav, flac, m4a, aac)',
	})
	fileName: string;

	@IsString({ message: 'Author must be a string' })
	@IsNotEmpty({ message: 'Author cannot be empty' })
	@Length(1, 100, { message: 'Author name must be between 1 and 100 characters' })
	author: string;

	@IsString({ message: 'Album must be a string' })
	@IsNotEmpty({ message: 'Album cannot be empty' })
	@Length(1, 100, { message: 'Album name must be between 1 and 100 characters' })
	album: string;

	@IsString({ message: 'Genre must be a string' })
	@IsNotEmpty({ message: 'Genre cannot be empty' })
	@IsIn(GENRES, { message: 'Unknown music genre' })
	genre: string;

	@Transform(({ value }) => parseInt(value))
	@Type(() => Number)
	year: number;

	@IsOptional()
	poster?: Express.Multer.File;

	@IsUrl({}, { message: 'Invalid URL format for poster' })
	@IsOptional()
	posterUrl?: string;

	@IsOptional()
	@IsObject({ message: 'Metadata must be an object' })
	metadata?: Record<string, any>;
}
