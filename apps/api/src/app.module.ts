import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './modules/database/database.module';
import { ObservabilityModule } from './modules/observability/observability.module';
import { PaqueteriaModule } from './modules/paqueteria/paqueteria.module';

const isTest = process.env.NODE_ENV === 'test';
const infrastructureModules = isTest ? [] : [DatabaseModule];
const domainModules = isTest ? [] : [PaqueteriaModule];

@Module({
  imports: [AuthModule, ...infrastructureModules, ...domainModules, HealthModule, ObservabilityModule],
})
export class AppModule {}
