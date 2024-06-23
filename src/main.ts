import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { envs } from './config/envs';

async function bootstrap() {
  const logger = new Logger('Main');
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use((req, res, next) => {
    res.on('finish', () => {
      logger.log(`${req.method} ${req.originalUrl} ${res.statusCode}`, 'HTTP');
    });
    next();
  })

  await app.listen(envs.port, '0.0.0.0');
  logger.log(`Server running on ${await app.getUrl()}`);
}
bootstrap();
