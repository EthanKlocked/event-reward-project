// ######################## IMPORT ##########################
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './controllers/auth.controller';
import { EventsController } from './controllers/events.controller';
import { RewardsController } from './controllers/rewards.controller';
import { RewardRequestsController } from './controllers/reward-requests.controller';
import { RewardHistoryController } from './controllers/reward-history.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { LoggerModule } from './logger/logger.module';

// ######################## LOGIC ###########################
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    LoggerModule,
  ],
  controllers: [
    AppController,
    AuthController,
    EventsController,
    RewardsController,
    RewardRequestsController,
    RewardHistoryController,
  ],
  providers: [AppService, AuthGuard, RolesGuard],
})

// ######################## EXPORT ##########################
export class AppModule {}
