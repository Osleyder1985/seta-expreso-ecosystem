import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ObservabilityMiddleware } from './observability.middleware';

@Module({
  providers: [ObservabilityMiddleware],
  exports: [ObservabilityMiddleware],
})
export class ObservabilityModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(ObservabilityMiddleware).forRoutes('*');
  }
}
