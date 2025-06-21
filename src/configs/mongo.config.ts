import { ConfigService } from '@nestjs/config';
import { MongooseModuleFactoryOptions } from '@nestjs/mongoose';

export const getMongoConfig = async (
	configService: ConfigService,
): Promise<MongooseModuleFactoryOptions> => {
	return {
		uri: `mongodb+srv://${configService.get('MONGO_LOGIN')}:${configService.get('MONGO_PASSWORD')}@${configService.get('MONGO_HOST')}${configService.get('MONGO_PORT') ? ':' + configService.get('MONGO_PORT') : ''}/${configService.get('MONGO_DATABASE')}?retryWrites=true&w=majority&appName=${configService.get('MONGO_APP_NAME')}`,
		autoIndex: true,
	};
};
