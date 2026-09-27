import { Test } from '@nestjs/testing';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { PrismaService } from '../database/prisma.service';
import { PaqueteriaModule } from './paqueteria.module';
import { ManifestService } from './manifest/manifest.service';

describe('Paqueteria module bootstrap', () => {
  it('resolves ManifestService and AuthorizationService through the real module graph', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [DatabaseModule, AuthModule, PaqueteriaModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();

    expect(moduleRef.get(ManifestService)).toBeInstanceOf(ManifestService);
  });
});
