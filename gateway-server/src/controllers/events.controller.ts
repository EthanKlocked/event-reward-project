// ######################## IMPORT ##########################
import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  Res,
  Req,
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
import { RequestWithUser } from 'src/request.interfaces';
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
@Controller('events')
@ApiTags('events')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class EventsController {
  constructor(
    private readonly httpService: HttpService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
  ) {}

  @Get()
  @Roles('USER', 'OPERATOR', 'AUDITOR', 'ADMIN')
  @ApiOperation({
    summary: '이벤트 목록 조회',
    description: '조건에 맞는 이벤트 목록을 조회합니다.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ACTIVE', 'INACTIVE'],
    description: '이벤트 상태 필터',
  })
  @ApiQuery({
    name: 'createdBy',
    required: false,
    description: '생성자 ID 필터',
  })
  @ApiResponse({
    status: 200,
    description: '이벤트 목록 조회 성공',
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async findAll(@Query() query: any, @Res() res: Response): Promise<void> {
    try {
      const eventServiceUrl =
        process.env.EVENT_SERVICE_URL || 'http://localhost:3002';
      const targetUrl = `${eventServiceUrl}/events`;
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

  @Post()
  @Roles('OPERATOR', 'ADMIN')
  @ApiOperation({
    summary: '이벤트 생성',
    description: '새로운 이벤트를 생성합니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'title',
        'startDate',
        'endDate',
        'conditionType',
        'conditionValue',
      ],
      properties: {
        title: { type: 'string', example: '7일 연속 출석 이벤트' },
        description: { type: 'string', example: '7일 연속 출석 시 보상 지급' },
        startDate: {
          type: 'string',
          format: 'date-time',
          example: '2025-04-20T00:00:00.000Z',
        },
        endDate: {
          type: 'string',
          format: 'date-time',
          example: '2025-06-20T23:59:59.999Z',
        },
        status: {
          type: 'string',
          enum: ['ACTIVE', 'INACTIVE'],
          default: 'ACTIVE',
        },
        conditionType: { type: 'string', example: 'LOGIN_DAYS' },
        conditionValue: { type: 'number', example: 7 },
        verificationType: {
          type: 'string',
          enum: ['AUTO', 'MANUAL'],
          default: 'AUTO',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: '이벤트 생성 성공' })
  @ApiResponse({ status: 400, description: '유효하지 않은 입력' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  async create(
    @Body() eventData: any,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const userId = req.user.id;
      eventData.createdBy = userId;
      const eventServiceUrl =
        process.env.EVENT_SERVICE_URL || 'http://localhost:3002';
      const targetUrl = `${eventServiceUrl}/events`;
      const response = await lastValueFrom(
        this.httpService.post(targetUrl, eventData, {
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

  @Get(':id')
  @Roles('USER', 'OPERATOR', 'AUDITOR', 'ADMIN')
  @ApiOperation({
    summary: '이벤트 상세 조회',
    description: '특정 이벤트의 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '이벤트 ID' })
  @ApiResponse({ status: 200, description: '이벤트 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '이벤트 찾을 수 없음' })
  async findOne(@Param('id') id: string, @Res() res: Response): Promise<void> {
    try {
      const eventServiceUrl =
        process.env.EVENT_SERVICE_URL || 'http://localhost:3002';
      const targetUrl = `${eventServiceUrl}/events/${id}`;
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

  @Put(':id')
  @Roles('OPERATOR', 'ADMIN')
  @ApiOperation({
    summary: '이벤트 수정',
    description: '특정 이벤트 정보를 수정합니다.',
  })
  @ApiParam({ name: 'id', description: '이벤트 ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example: '수정된 이벤트 제목',
          description: '이벤트 제목',
        },
        description: {
          type: 'string',
          example: '이벤트 설명이 수정되었습니다',
          description: '이벤트 설명',
        },
        startDate: {
          type: 'string',
          format: 'date-time',
          example: '2025-04-20T00:00:00.000Z',
          description: '이벤트 시작일',
        },
        endDate: {
          type: 'string',
          format: 'date-time',
          example: '2025-06-20T23:59:59.999Z',
          description: '이벤트 종료일',
        },
        status: {
          type: 'string',
          enum: ['ACTIVE', 'INACTIVE'],
          example: 'INACTIVE',
          description: '이벤트 상태 (활성/비활성)',
        },
        conditionType: {
          type: 'string',
          enum: ['LOGIN_DAYS', 'INVITE_FRIENDS'],
          example: 'INVITE_FRIENDS',
          description:
            '이벤트 조건 타입 (LOGIN_DAYS: 로그인 일수, INVITE_FRIENDS: 친구 초대)',
        },
        conditionValue: {
          type: 'number',
          example: 5,
          description: '이벤트 조건 값 (예: 5명 친구 초대)',
        },
        verificationType: {
          type: 'string',
          enum: ['AUTO', 'MANUAL'],
          example: 'MANUAL',
          description: '검증 방식 (AUTO: 자동 검증, MANUAL: 수동 검증)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: '이벤트 수정 성공' })
  @ApiResponse({ status: 400, description: '유효하지 않은 입력' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '이벤트 찾을 수 없음' })
  async update(
    @Param('id') id: string,
    @Body() updateData: any,
    @Res() res: Response,
  ): Promise<void> {
    try {
      console.log(
        'Update event request received for ID:',
        id,
        'with data:',
        updateData,
      );
      const eventServiceUrl =
        process.env.EVENT_SERVICE_URL || 'http://localhost:3002';
      const targetUrl = `${eventServiceUrl}/events/${id}`;
      const response = await lastValueFrom(
        this.httpService.put(targetUrl, updateData, {
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

  @Get(':id/check-condition/:userId')
  @Roles('USER', 'OPERATOR', 'ADMIN')
  @ApiOperation({
    summary: '이벤트 조건 확인',
    description: '특정 사용자가 이벤트 조건을 충족하는지 확인합니다.',
  })
  @ApiParam({ name: 'id', description: '이벤트 ID' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '조건 확인 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '이벤트 또는 사용자 찾을 수 없음' })
  async checkCondition(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      console.log(
        'Check condition request received for event ID:',
        id,
        'and user ID:',
        userId,
      );
      const eventServiceUrl =
        process.env.EVENT_SERVICE_URL || 'http://localhost:3002';
      const targetUrl = `${eventServiceUrl}/events/${id}/check-condition/${userId}`;
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
