import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { UniformHttpExceptionFilter } from './http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new UniformHttpExceptionFilter());
  const config = new DocumentBuilder().setTitle('SETA EXPRESO Backend PoC').setVersion('0.1.0').build();
  SwaggerModule.setup('openapi', app, SwaggerModule.createDocument(app, config));
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();