import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

export type RefreshDocument = HydratedDocument<RefreshModel>;

@Schema({ timestamps: true })
export class RefreshModel {
	@Prop({ type: String, require: true })
	refreshToken: string;

	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	userId: Types.ObjectId;
}

export const RefreshSchema = SchemaFactory.createForClass(RefreshModel);
