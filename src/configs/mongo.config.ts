import { ConfigService } from '@nestjs/config';
import { MongooseModuleFactoryOptions } from '@nestjs/mongoose';

export const getMongoConfig = async (
	configService: ConfigService,
): Promise<MongooseModuleFactoryOptions> => {
	return {
		uri: `mongodb://${configService.get('MONGO_LOGIN')}:${configService.get('MONGO_PASSWORD')}@${configService.get('MONGO_HOST')}:${configService.get('MONGO_PORT')}/${configService.get('MONGO_DATABASE')}?authSource=${configService.get('MONGO_AUTHDATABASE')}`,
		autoIndex: true,
	};
};
