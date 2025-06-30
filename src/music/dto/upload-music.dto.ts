import { IsIn, IsNotEmpty, IsObject, IsOptional, IsString, IsUrl, Length } from 'class-validator';
import { GENRES } from '../constants/genres.constant';
import { Transform, Type } from 'class-transformer';

export class UploadMusicDto {
	@IsString({ message: 'Title name must be a string' })
	@IsNotEmpty({ message: 'Title name cannot be empty' })
	@Length(1, 100, { message: 'Title name must be between 1 and 100 characters' })
	title: string;

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
	@IsObject({ message: 'Metadata must be an object' })
	metadata?: Record<string, any>;
}
