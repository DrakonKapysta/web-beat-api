import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<UserModel>;

@Schema({ timestamps: true })
export class UserModel {
	_id: Types.ObjectId;

	@Prop({ unique: true })
	email: string;

	@Prop()
	passwordHash: string;
}

export const UserShema = SchemaFactory.createForClass(UserModel);
