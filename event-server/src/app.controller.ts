// ######################## IMPORT ##########################
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

// ######################## LOGIC ###########################
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
