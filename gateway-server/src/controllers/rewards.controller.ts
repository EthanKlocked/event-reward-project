// ######################## IMPORT ##########################
import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Res,
  UseGuards,
  Inject,
  LoggerService,
} from '@nestjs/common';
import { Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

// ######################## LOGIC ###########################
@Controller('rewards')
@ApiTags('rewards')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class RewardsController {
  constructor(
    private readonly httpService: HttpService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
  ) {}

  @Get()
  @Roles('USER', 'OPERATOR', 'AUDITOR', 'ADMIN')
  @ApiOperation({
    summary: '보상 목록 조회',
    description: '조건에 맞는 보상 목록을 조회합니다.',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['POINT', 'ITEM', 'COUPON'],
    description: '보상 타입 필터',
  })
  @ApiQuery({ name: 'eventId', required: false, description: '이벤트 ID 필터' })
  @ApiResponse({ status: 200, description: '보상 목록 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async findAll(@Query() query: any, @Res() res: Response): Promise<void> {
    try {
      console.log('Rewards list request received with query:', query);

      const eventServiceUrl =
        process.env.EVENT_SERVICE_URL || 'http://localhost:3002';
      const targetUrl = `${eventServiceUrl}/rewards`;

      console.log('Sending request to:', targetUrl);

      // 직접 HTTP 요청 보내기
      const response = await lastValueFrom(
        this.httpService.get(targetUrl, {
          params: query,
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }),
      );

      console.log('Rewards list response received:', response.status);

      // 응답 전송
      res.status(response.status).send(response.data);
    } catch (error) {
      console.error('Rewards list error:', error.message);

      if (error.response) {
        res.status(error.response.status).send(error.response.data);
      } else {
        res.status(500).send({
          message: 'Internal Server Error',
          error: error.message,
        });
      }
    }
  }

  @Post()
  @Roles('OPERATOR', 'ADMIN')
  @ApiOperation({
    summary: '보상 생성',
    description: '새로운 보상을 생성합니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['eventId', 'type', 'name', 'quantity'],
      properties: {
        eventId: { type: 'string', description: '이벤트 ID' },
        type: {
          type: 'string',
          enum: ['POINT', 'ITEM', 'COUPON'],
          description: '보상 타입',
        },
        name: {
          type: 'string',
          description: '보상 이름/설명',
          example: '게임 포인트',
        },
        quantity: { type: 'number', description: '보상 수량', example: 1000 },
      },
    },
  })
  @ApiResponse({ status: 201, description: '보상 생성 성공' })
  @ApiResponse({ status: 400, description: '유효하지 않은 입력' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '이벤트 찾을 수 없음' })
  async create(@Body() rewardData: any, @Res() res: Response): Promise<void> {
    try {
      console.log('Create reward request received:', rewardData);

      const eventServiceUrl =
        process.env.EVENT_SERVICE_URL || 'http://localhost:3002';
      const targetUrl = `${eventServiceUrl}/rewards`;

      console.log('Sending request to:', targetUrl);

      // 직접 HTTP 요청 보내기
      const response = await lastValueFrom(
        this.httpService.post(targetUrl, rewardData, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }),
      );

      console.log('Create reward response received:', response.status);

      // 응답 전송
      res.status(response.status).send(response.data);
    } catch (error) {
      console.error('Create reward error:', error.message);

      if (error.response) {
        res.status(error.response.status).send(error.response.data);
      } else {
        res.status(500).send({
          message: 'Internal Server Error',
          error: error.message,
        });
      }
    }
  }

  @Get(':id')
  @Roles('USER', 'OPERATOR', 'AUDITOR', 'ADMIN')
  @ApiOperation({
    summary: '보상 상세 조회',
    description: '특정 보상의 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '보상 ID' })
  @ApiResponse({ status: 200, description: '보상 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '보상 찾을 수 없음' })
  async findOne(@Param('id') id: string, @Res() res: Response): Promise<void> {
    try {
      console.log('Reward detail request received for ID:', id);

      const eventServiceUrl =
        process.env.EVENT_SERVICE_URL || 'http://localhost:3002';
      const targetUrl = `${eventServiceUrl}/rewards/${id}`;

      console.log('Sending request to:', targetUrl);

      // 직접 HTTP 요청 보내기
      const response = await lastValueFrom(
        this.httpService.get(targetUrl, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }),
      );

      console.log('Reward detail response received:', response.status);

      // 응답 전송
      res.status(response.status).send(response.data);
    } catch (error) {
      console.error('Reward detail error:', error.message);

      if (error.response) {
        res.status(error.response.status).send(error.response.data);
      } else {
        res.status(500).send({
          message: 'Internal Server Error',
          error: error.message,
        });
      }
    }
  }

  @Get('event/:eventId')
  @Roles('USER', 'OPERATOR', 'AUDITOR', 'ADMIN')
  @ApiOperation({
    summary: '이벤트별 보상 목록 조회',
    description: '특정 이벤트에 연결된 보상 목록을 조회합니다.',
  })
  @ApiParam({ name: 'eventId', description: '이벤트 ID' })
  @ApiResponse({ status: 200, description: '이벤트별 보상 목록 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '이벤트 찾을 수 없음' })
  async findByEventId(
    @Param('eventId') eventId: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      console.log('Event rewards request received for event ID:', eventId);

      const eventServiceUrl =
        process.env.EVENT_SERVICE_URL || 'http://localhost:3002';
      const targetUrl = `${eventServiceUrl}/rewards/event/${eventId}`;

      console.log('Sending request to:', targetUrl);

      // 직접 HTTP 요청 보내기
      const response = await lastValueFrom(
        this.httpService.get(targetUrl, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }),
      );

      console.log('Event rewards response received:', response.status);

      // 응답 전송
      res.status(response.status).send(response.data);
    } catch (error) {
      console.error('Event rewards error:', error.message);

      if (error.response) {
        res.status(error.response.status).send(error.response.data);
      } else {
        res.status(500).send({
          message: 'Internal Server Error',
          error: error.message,
        });
      }
    }
  }
}
