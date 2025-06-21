import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MusicDocument = HydratedDocument<MusicModel>;

@Schema({ timestamps: true })
export class MusicModel {
	@Prop({ required: true })
	title: string;

	@Prop({ required: true })
	author: string;

	@Prop({ required: true })
	album: string;

	@Prop({ required: true })
	genre: string;

	@Prop({ required: true })
	year: number;

	@Prop()
	posterUrl?: string;

	@Prop({ type: Object })
	metadata?: Record<string, any>;
}

export const MusicSchema = SchemaFactory.createForClass(MusicModel);

MusicSchema.index({ author: 1, album: 1 });
MusicSchema.index({ genre: 1, year: -1 });
MusicSchema.index({ author: 1, year: -1 });

MusicSchema.index(
	{
		title: 'text',
		author: 'text',
		album: 'text',
		genre: 'text',
	},
	{
		name: 'music_text_search',
		weights: {
			title: 10,
			author: 8,
			album: 5,
			genre: 3,
		},
	},
);

MusicSchema.index({ createdAt: -1 });

MusicSchema.index({ year: 1, genre: 1 });
