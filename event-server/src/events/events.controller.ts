// ######################## IMPORT ##########################
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './schemas/event.schema';

// ######################## LOGIC ###########################
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async create(@Body() createEventDto: CreateEventDto): Promise<Event> {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  async findAll(@Query() query: any): Promise<Event[]> {
    const filters = {};
    if (query.status) {
      filters['status'] = query.status;
    }
    if (query.createdBy) {
      filters['createdBy'] = query.createdBy;
    }
    return this.eventsService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Event> {
    return this.eventsService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    return this.eventsService.update(id, updateEventDto);
  }

  @Get(':id/check-condition/:userId')
  async checkCondition(
    @Param('id') eventId: string,
    @Param('userId') userId: string,
  ): Promise<{ isConditionMet: boolean }> {
    if (!eventId || !userId) {
      throw new BadRequestException('Event ID and User ID are required');
    }
    const isConditionMet = await this.eventsService.checkCondition(
      userId,
      eventId,
    );
    return { isConditionMet };
  }
}
