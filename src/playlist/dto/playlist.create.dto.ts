import { IsMongoId, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class PlaylistCreateDto {
	@IsString({ message: 'Playlist name must be a string' })
	@IsNotEmpty({ message: 'Playlist name cannot be empty' })
	@Length(1, 100, { message: 'Playlist name must be between 1 and 100 characters' })
	name: string;

	@IsString({ message: 'Description must be a string' })
	@IsOptional()
	@Length(1, 1000, { message: 'Description must be between 1 and 1000 characters' })
	description?: string;
}
