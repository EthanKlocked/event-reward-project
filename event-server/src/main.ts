// ######################## IMPORT ##########################
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// ######################## LOGIC ###########################
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Settings
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API Docs
  const config = new DocumentBuilder()
    .setTitle('Event API')
    .setDescription('The Event and Reward Management API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3002);
  console.log('Event Server is running on: http://localhost:3002');
  console.log('Swagger API docs: http://localhost:3002/docs');
}

// ###################### EXECUTION #########################
bootstrap();
