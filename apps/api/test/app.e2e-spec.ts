import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('SETA EXPRESO API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health returns operational status', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect({
        status: 'ok',
        service: 'seta-expreso-api',
      });

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['referrer-policy']).toBe('no-referrer');
  });

  it('returns a safe 404 error envelope without stack details', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/does-not-exist')
      .expect(404);

    expect(response.body.statusCode).toBe(404);
    expect(response.body.error).toBeDefined();
    expect(response.body.message).toBeDefined();
    expect(response.body.path).toBe('/api/does-not-exist');
    expect(response.body.timestamp).toBeDefined();
    expect(response.body.stack).toBeUndefined();
  });

  it('GET /api/health is rate limited', async () => {
    const responses = await Promise.all(
      Array.from({ length: 21 }, () => request(app.getHttpServer()).get('/api/health')),
    );

    expect(responses.some((item) => item.status === 429)).toBe(true);
  });

});
