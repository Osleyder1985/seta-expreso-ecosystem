import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './modules/database/database.module';
import { ObservabilityModule } from './modules/observability/observability.module';

const infrastructureModules = process.env.NODE_ENV === 'test' ? [] : [DatabaseModule];

@Module({
  imports: [AuthModule, ...infrastructureModules, HealthModule, ObservabilityModule],
})
export class AppModule {}
