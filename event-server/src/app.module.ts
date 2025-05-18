// ######################## IMPORT ##########################
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { RewardsModule } from './rewards/rewards.module';
import { RequestsModule } from './requests/requests.module';
import { HistoryModule } from './history/history.module';
import { ValidatorsModule } from './validators/validators.module';

// ######################## LOGIC ###########################
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ||
          'mongodb://localhost:27017/event-db',
      }),
    }),
    // Application Modules
    EventsModule,
    RewardsModule,
    RequestsModule,
    HistoryModule,
    ValidatorsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

// ######################## EXPORT ##########################
export class AppModule {}
