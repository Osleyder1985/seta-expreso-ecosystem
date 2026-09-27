import { Module } from '@nestjs/common';
import { ManifestModule } from './manifest/manifest.module';

@Module({
  imports: [ManifestModule],
})
export class PaqueteriaModule {}
