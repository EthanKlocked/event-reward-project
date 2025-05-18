// ######################## IMPORT ##########################
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event, EventSchema } from './schemas/event.schema';
import { ValidatorsModule } from '../validators/validators.module';

// ######################## LOGIC ###########################
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    ValidatorsModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})

// ######################## EXPORT ##########################
export class EventsModule {}
