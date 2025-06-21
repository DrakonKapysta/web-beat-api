import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PlaylistDocument = HydratedDocument<PlaylistModel>;

@Schema({ timestamps: true })
export class PlaylistModel {
	_id: string;

	@Prop()
	name: string;

	@Prop()
	description: string;

	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	userId: Types.ObjectId;

	@Prop({
		type: [
			{
				trackId: { type: Types.ObjectId, ref: 'Music' },
				addedAt: { type: Date, default: Date.now },
			},
		],
	})
	tracks: Array<{ trackId: Types.ObjectId; addedAt: Date }>;
}

export const PlaylistSchema = SchemaFactory.createForClass(PlaylistModel);
