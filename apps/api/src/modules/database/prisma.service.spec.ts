import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  const original = process.env.DATABASE_URL;
  afterEach(() => {
    if (original === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = original;
  });
  it('requires DATABASE_URL', () => {
    delete process.env.DATABASE_URL;
    expect(() => new PrismaService()).toThrow('DATABASE_URL is required');
  });
});
