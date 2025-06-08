import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { disconnect, Types } from 'mongoose';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { USER_NOT_FOUND_ERROR, WRONG_PASSWORD_ERROR } from './../src/auth/auth.constants';

const loginDto: AuthDto = {
	login: 'test',
	password: '123',
};

describe('AuthController (e2e)', () => {
	let app: INestApplication<App>;
	let token: string;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	it('/auth/login (POST) - success', async () => {
		const res = await request(app.getHttpServer()).post('/auth/login').send(loginDto).expect(200);
		const body = res.body as { access_token: string };
		expect(body.access_token).toBeDefined();
	});

	it('/auth/login (POST) - fail password', async () => {
		const res = await request(app.getHttpServer())
			.post('/auth/login')
			.send({ ...loginDto, password: '1234' })
			.expect(HttpStatus.UNAUTHORIZED);
		expect(res.body).toEqual({
			statusCode: HttpStatus.UNAUTHORIZED,
			message: WRONG_PASSWORD_ERROR,
			error: 'Unauthorized',
		});
	});

	it('/auth/login (POST) - fail login', async () => {
		const res = await request(app.getHttpServer())
			.post('/auth/login')
			.send({ ...loginDto, login: 'test1' })
			.expect(HttpStatus.NOT_FOUND);
		expect(res.body).toEqual({
			statusCode: HttpStatus.NOT_FOUND,
			message: USER_NOT_FOUND_ERROR,
			error: 'Not Found',
		});
	});

	afterAll(async () => {
		await disconnect();
		await app.close();
	});
});
