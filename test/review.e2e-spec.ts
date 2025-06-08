import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { CreateReviewDto } from '../src/review/dto/create-review.dto';
import { disconnect, Types } from 'mongoose';
import { ReviewModel } from 'src/review/review.model';
import { REVIEW_NOT_FOUND } from '../src/review/review.constants';

type CreateReviewResponse = {
	_id: string;
};

const productId = new Types.ObjectId().toString();

const testDTO: CreateReviewDto = {
	name: 'test name',
	title: 'test title',
	description: 'test description',
	rating: 5,
	productId,
};

describe('AppController (e2e)', () => {
	let app: INestApplication<App>;
	let createdId: string;
	let token: string;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

		const res = await request(app.getHttpServer()).post('/auth/login').send({
			login: 'test',
			password: '123',
		});
		const body = res.body as { access_token: string };
		token = body.access_token;
	});

	afterAll(async () => {
		await disconnect();
		await app.close();
	});

	it('/review/create (POST) - success', async () => {
		const res = await request(app.getHttpServer()).post('/review/create').send(testDTO).expect(201);
		const body = res.body as CreateReviewResponse;
		expect(body._id).toBeDefined();
		createdId = body._id;
	});

	it('/review/create (POST) - fail', async () => {
		const res = await request(app.getHttpServer())
			.post('/review/create')
			.send({ ...testDTO, rating: 6 })
			.expect(400);
	});

	it('/review/byProduct/:productId (GET) - success', async () => {
		const res = await request(app.getHttpServer())
			.get('/review/byProduct/' + productId)
			.expect(200);
		const body = res.body as ReviewModel[];
		expect(body.length).toBeGreaterThanOrEqual(1);
	});

	it('/review/byProduct/:productId (GET) - fail', async () => {
		const res = await request(app.getHttpServer())
			.get('/review/byProduct/' + new Types.ObjectId().toString())
			.expect(200);
		const body = res.body as ReviewModel[];
		expect(body.length).toBe(0);
	});

	it('/review/:id (DELETE) - success', async () => {
		await request(app.getHttpServer())
			.delete('/review/' + createdId)
			.set('Authorization', 'Bearer ' + token)
			.expect(200);
	});

	it('/review/:id (DELETE) - fail', async () => {
		await request(app.getHttpServer())
			.delete('/review/' + new Types.ObjectId().toString())
			.set('Authorization', 'Bearer ' + token)
			.expect(404, {
				statusCode: 404,
				message: REVIEW_NOT_FOUND,
			});
	});
});
