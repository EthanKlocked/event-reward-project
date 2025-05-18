// ######################## IMPORT ##########################
import { Injectable } from '@nestjs/common';

// ######################## LOGIC ###########################
@Injectable()
export class AppService {
  getHello(): string {
    return 'Auth Server Running!';
  }
}
