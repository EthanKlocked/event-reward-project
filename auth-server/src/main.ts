// ######################## IMPORT ##########################
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// ######################## LOGIC ###########################
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API Docs
  const config = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('The Authentication API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Execution
  await app.listen(3001);
  console.log('Auth Server is running on: http://localhost:3001');
  console.log('Swagger API docs: http://localhost:3001/docs');
}

// ###################### EXECUTION #########################
bootstrap();
