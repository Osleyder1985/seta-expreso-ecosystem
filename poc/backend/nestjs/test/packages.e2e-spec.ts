import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('packages', () => {
  let app: INestApplication;
  beforeAll(async () => { const moduleRef = await Test.createTestingModule({ imports:[AppModule] }).compile(); app=moduleRef.createNestApplication(); await app.init(); });
  afterAll(async () => { await app.close(); });

  it('CRUD', async () => {
    const c=await request(app.getHttpServer()).post('/packages').send({house:'POC-1',weightKg:2.5,recipientAddress:'Camagüey'}).expect(201);
    const id=c.body.id;
    await request(app.getHttpServer()).get('/packages/'+id).expect(200);
    await request(app.getHttpServer()).patch('/packages/'+id).send({weightKg:3}).expect(200);
    await request(app.getHttpServer()).get('/packages').expect(200);
    await request(app.getHttpServer()).delete('/packages/'+id).expect(200);
  });

  it('validates', async () => {
    const response=await request(app.getHttpServer()).post('/packages').send({house:'',weightKg:-1}).expect(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});