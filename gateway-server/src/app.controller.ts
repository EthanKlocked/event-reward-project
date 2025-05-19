// ######################## IMPORT ##########################
import { Controller, Get, Redirect, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Response } from 'express';
import { AppService } from './app.service';

// ######################## LOGIC ###########################
@ApiExcludeController()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHome(@Res() res: Response) {
    return res.header('Content-Type', 'text/html').send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>이벤트/보상 관리 플랫폼</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #333; }
            .card { background: #f8f9fa; border-radius: 5px; padding: 20px; margin-top: 20px; }
            a { display: inline-block; background: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
            a:hover { background: #0069d9; }
          </style>
        </head>
        <body>
          <h1>이벤트/보상 관리 플랫폼 API Gateway</h1>
          <div class="card">
            <p>이 서버는 이벤트/보상 관리 플랫폼의 API Gateway입니다.</p>
            <p>모든 서비스의 API 문서는 Swagger를 통해 확인하실 수 있습니다.</p>
            <a href="/api/docs">API 문서 보기</a>
          </div>
        </body>
      </html>
    `);
  }

  @Get('docs')
  @Redirect('/api/docs')
  redirectToDocs() {
    return; 
  }
}