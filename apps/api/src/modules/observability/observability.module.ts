import { Module } from '@nestjs/common';
import { ObservabilityMiddleware } from './observability.middleware';

@Module({
  providers: [ObservabilityMiddleware],
  exports: [ObservabilityMiddleware],
})
export class ObservabilityModule {}
