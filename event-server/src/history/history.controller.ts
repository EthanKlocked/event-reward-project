// ######################## IMPORT ##########################
import { Controller, Get, Param, Query } from '@nestjs/common';
import { HistoryService } from './history.service';
import { History } from './schemas/history.schema';

// ######################## LOGIC ###########################
@Controller('reward-history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  async findAll(@Query() query: any): Promise<History[]> {
    const filters = {};
    if (query.userId) {
      filters['userId'] = query.userId;
    }
    if (query.eventId) {
      filters['eventId'] = query.eventId;
    }
    return this.historyService.findAll(filters);
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<History[]> {
    return this.historyService.findByUserId(userId);
  }

  @Get('event/:eventId')
  async findByEventId(@Param('eventId') eventId: string): Promise<History[]> {
    return this.historyService.findByEventId(eventId);
  }
}
