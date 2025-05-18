// ######################## IMPORT ##########################
import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Res,
  Req,
  UseGuards,
  Inject,
  LoggerService,
  ForbiddenException,
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
@Controller('reward-requests')
@ApiTags('reward-requests')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class RewardRequestsController {
  constructor(
    private readonly httpService: HttpService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
  ) {}

  @Get()
  @Roles('OPERATOR', 'AUDITOR', 'ADMIN')
  @ApiOperation({
    summary: '보상 요청 목록 조회',
    description: '모든 보상 요청 목록을 조회합니다. (관리자용)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'],
    description: '요청 상태 필터',
  })
  @ApiQuery({ name: 'eventId', required: false, description: '이벤트 ID 필터' })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: '사용자 ID 필터 (특정 사용자의 요청만 조회)',
  })
  @ApiResponse({ status: 200, description: '보상 요청 목록 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  async findAll(@Query() query: any, @Res() res: Response): Promise<void> {
    try {
      const eventServiceUrl =
        process.env.EVENT_SERVICE_URL || 'http://localhost:3002';
      const targetUrl = `${eventServiceUrl}/reward-requests`;
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
  @Roles('USER', 'ADMIN')
  @ApiOperation({
    summary: '보상 요청 생성',
    description: `특정 이벤트에 대한 보상을 요청합니다.
    
  - USER 역할: 요청 본문에 입력한 userId와 관계없이 항상 로그인한 사용자 자신의 ID로 요청이 생성됩니다.
  - ADMIN 역할: 요청 본문에 지정한 userId로 다른 사용자를 대신하여 보상 요청을 생성할 수 있습니다.`,
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['eventId'],
      properties: {
        userId: {
          type: 'string',
          description:
            '사용자 ID (USER 역할의 경우 자동으로 현재 로그인한 사용자 ID로 설정됨, ADMIN 역할의 경우 다른 사용자 ID 지정 가능)',
          example: '60d21b4667d0d8992e610c86',
        },
        eventId: {
          type: 'string',
          description: '이벤트 ID',
          example: '60d21b4667d0d8992e610c85',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: '보상 요청 생성 성공' })
  @ApiResponse({
    status: 400,
    description: '유효하지 않은 입력, 이미 요청됨, 또는 이벤트 조건 불충족',
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '이벤트 찾을 수 없음' })
  async create(
    @Body() requestData: any,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<void> {
    try {
      if (req.user.role === 'USER' && req.user.id !== requestData.userId) {
        if (requestData.userId && requestData.userId !== req.user.id) {
          console.log(
            `User ${req.user.id} attempted to create request for ${requestData.userId}. Automatically using user's own ID.`,
          );
        }
        requestData.userId = req.user.id;
      }

      const eventServiceUrl =
        process.env.EVENT_SERVICE_URL || 'http://localhost:3002';
      const targetUrl = `${eventServiceUrl}/reward-requests`;
      const response = await lastValueFrom(
        this.httpService.post(targetUrl, requestData, {
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

  @Get('my')
  @Roles('USER', 'ADMIN')
  @ApiOperation({
    summary: '내 보상 요청 목록 조회',
    description: '현재 로그인한 사용자의 보상 요청 목록을 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '내 보상 요청 목록 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async findByUserId(
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const eventServiceUrl =
        process.env.EVENT_SERVICE_URL || 'http://localhost:3002';
      const targetUrl = `${eventServiceUrl}/reward-requests/my`;
      const response = await lastValueFrom(
        this.httpService.get(targetUrl, {
          params: { userId: req.user.id },
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
    summary: '보상 요청 상세 조회',
    description: '특정 보상 요청의 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '보상 요청 ID' })
  @ApiResponse({ status: 200, description: '보상 요청 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '보상 요청 찾을 수 없음' })
  async findOne(@Param('id') id: string, @Res() res: Response): Promise<void> {
    try {
      const eventServiceUrl =
        process.env.EVENT_SERVICE_URL || 'http://localhost:3002';
      const targetUrl = `${eventServiceUrl}/reward-requests/${id}`;
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

  @Post(':id/process')
  @Roles('OPERATOR', 'ADMIN')
  @ApiOperation({
    summary: '보상 요청 처리',
    description: '특정 보상 요청을 승인하거나 거절합니다.',
  })
  @ApiParam({ name: 'id', description: '보상 요청 ID' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: {
          type: 'string',
          enum: ['APPROVED', 'REJECTED'],
          description: '처리 상태',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: '보상 요청 처리 성공' })
  @ApiResponse({
    status: 400,
    description: '유효하지 않은 입력 또는 이미 처리된 요청',
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '보상 요청 찾을 수 없음' })
  async processRequest(
    @Param('id') id: string,
    @Body() processData: any,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const userId = req.user.id;
      processData.processedBy = userId;
      const eventServiceUrl =
        process.env.EVENT_SERVICE_URL || 'http://localhost:3002';
      const targetUrl = `${eventServiceUrl}/reward-requests/${id}/process`;
      const response = await lastValueFrom(
        this.httpService.post(targetUrl, processData, {
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
