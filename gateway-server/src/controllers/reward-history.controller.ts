// ######################## IMPORT ##########################
import {
  Controller,
  Get,
  Param,
  Query,
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
  ApiResponse,
} from '@nestjs/swagger';

// ######################## LOGIC ###########################
@Controller('reward-history')
@ApiTags('reward-history')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class RewardHistoryController {
  constructor(
    private readonly httpService: HttpService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
  ) {}

  @Get()
  @Roles('AUDITOR', 'ADMIN')
  @ApiOperation({
    summary: '보상 이력 목록 조회',
    description: '모든 보상 지급 이력을 조회합니다. (감사자/관리자용)',
  })
  @ApiQuery({ name: 'userId', required: false, description: '사용자 ID 필터' })
  @ApiQuery({ name: 'eventId', required: false, description: '이벤트 ID 필터' })
  @ApiResponse({ status: 200, description: '보상 이력 목록 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  async findAll(@Query() query: any, @Res() res: Response): Promise<void> {
    try {
      const eventServiceUrl =
        process.env.EVENT_SERVICE_URL || 'http://localhost:3002';
      const targetUrl = `${eventServiceUrl}/reward-history`;
      const response = await lastValueFrom(
        this.httpService.get(targetUrl, {
          params: query,
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }),
      );
      res.status(response.status).send(response.data);
    } catch (error) {
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

  @Get('user/:userId')
  @Roles('USER', 'AUDITOR', 'ADMIN')
  @ApiOperation({
    summary: '사용자별 보상 이력 조회',
    description: '특정 사용자의 보상 지급 이력을 조회합니다.',
  })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '사용자별 보상 이력 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  async findByUserId(
    @Param('userId') userId: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const eventServiceUrl =
        process.env.EVENT_SERVICE_URL || 'http://localhost:3002';
      const targetUrl = `${eventServiceUrl}/reward-history/user/${userId}`;
      const response = await lastValueFrom(
        this.httpService.get(targetUrl, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }),
      );
      res.status(response.status).send(response.data);
    } catch (error) {
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
  @Roles('AUDITOR', 'ADMIN')
  @ApiOperation({
    summary: '이벤트별 보상 이력 조회',
    description: '특정 이벤트의 보상 지급 이력을 조회합니다.',
  })
  @ApiParam({ name: 'eventId', description: '이벤트 ID' })
  @ApiResponse({ status: 200, description: '이벤트별 보상 이력 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  async findByEventId(
    @Param('eventId') eventId: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const eventServiceUrl =
        process.env.EVENT_SERVICE_URL || 'http://localhost:3002';
      const targetUrl = `${eventServiceUrl}/reward-history/event/${eventId}`;
      const response = await lastValueFrom(
        this.httpService.get(targetUrl, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }),
      );
      res.status(response.status).send(response.data);
    } catch (error) {
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
