// ######################## IMPORT ##########################
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { Reward } from './schemas/reward.schema';

// ######################## LOGIC ###########################
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Post()
  async create(@Body() createRewardDto: CreateRewardDto): Promise<Reward> {
    return this.rewardsService.create(createRewardDto);
  }

  @Get()
  async findAll(@Query() query: any): Promise<Reward[]> {
    const filters = {};
    if (query.type) {
      filters['type'] = query.type;
    }
    if (query.eventId) {
      filters['eventId'] = query.eventId;
    }
    return this.rewardsService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Reward> {
    return this.rewardsService.findById(id);
  }

  @Get('event/:eventId')
  async findByEventId(@Param('eventId') eventId: string): Promise<Reward[]> {
    return this.rewardsService.findByEventId(eventId);
  }
}
