// ######################## IMPORT ##########################
import { Injectable } from '@nestjs/common';

// ######################## LOGIC ###########################
@Injectable()
export class AppService {
  getHello(): string {
    return 'Event Server Running!';
  }
}
