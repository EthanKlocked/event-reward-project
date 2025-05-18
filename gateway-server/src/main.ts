// ######################## IMPORT ##########################
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';

// ######################## LOGIC ###########################
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Winston Logger
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  // Global Settings
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(
    new HttpExceptionFilter(app.get(WINSTON_MODULE_NEST_PROVIDER)),
  );

  app.useGlobalInterceptors(
    new ResponseInterceptor(app.get(WINSTON_MODULE_NEST_PROVIDER)),
  );

  // API Docs
  const config = new DocumentBuilder()
    .setTitle('이벤트/보상 관리 API')
    .setDescription('이벤트 생성, 보상 관리, 보상 요청 및 지급에 관한 API 문서')
    .setVersion('1.0')
    .addTag('auth', '인증 및 사용자 관리')
    .addTag('events', '이벤트 관리')
    .addTag('rewards', '보상 관리')
    .addTag('reward-requests', '보상 요청 처리')
    .addTag('reward-history', '보상 지급 이력')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: '인증을 위한 JWT 토큰을 입력하세요',
        in: 'header',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tagsSorter: 'alpha',
    },
  });

  // Execution
  await app.listen(3000);
  logger.log('Gateway Server is running on: http://localhost:3000');
  logger.log('Swagger API docs: http://localhost:3000/api/docs');
}
// ###################### EXECUTION #########################
bootstrap();
