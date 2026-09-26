import { INestApplication } from '@nestjs/common';
import { HttpErrorFilter } from '../src/common/http/http-error.filter';
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
    app.useSecurityHeaders();
    app.useGlobalFilters(new HttpErrorFilter());
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


  it('GET /api/health is rate limited', async () => {
    const statuses: number[] = [];
    for (let index = 0; index < 21; index += 1) {
      const response = await request(app.getHttpServer()).get('/api/health');
      statuses.push(response.status);
    }

    expect(statuses.filter((status) => status === 429).length).toBeGreaterThanOrEqual(1);
  });

});
