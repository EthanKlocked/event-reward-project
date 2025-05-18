// ######################## IMPORT ##########################
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { ProcessRequestDto } from './dto/process-request.dto';
import { Request } from './schemas/request.schema';

// ######################## LOGIC ###########################
@Controller('reward-requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  async create(@Body() createRequestDto: CreateRequestDto): Promise<Request> {
    return this.requestsService.create(createRequestDto);
  }

  @Post(':id/process')
  async process(
    @Param('id') id: string,
    @Body() processRequestDto: ProcessRequestDto,
  ): Promise<Request> {
    return this.requestsService.processRequest(id, processRequestDto);
  }

  @Get()
  async findAll(@Query() query: any): Promise<Request[]> {
    const filters = {};
    if (query.status) {
      filters['status'] = query.status;
    }
    if (query.eventId) {
      filters['eventId'] = query.eventId;
    }
    if (query.userId) {
      filters['userId'] = query.userId;
    }
    return this.requestsService.findAll(filters);
  }

  @Get('my')
  async findByUserId(@Query('userId') userId: string): Promise<Request[]> {
    return this.requestsService.findByUserId(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Request> {
    return this.requestsService.findById(id);
  }
}
