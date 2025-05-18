// ######################## IMPORT ##########################
import {
  Controller,
  Get,
  Post,
  Res,
  Req,
  Body,
  Inject,
  LoggerService,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RequestWithUser } from 'src/request.interfaces';

// ######################## LOGIC ###########################
@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly httpService: HttpService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: '사용자 등록',
    description: '새로운 사용자 계정을 생성합니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['username', 'password'],
      properties: {
        username: { type: 'string', example: 'user123' },
        password: { type: 'string', example: 'password123' },
        role: {
          type: 'string',
          enum: ['USER', 'OPERATOR', 'AUDITOR', 'ADMIN'],
          default: 'USER',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '사용자 등록 성공',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        username: { type: 'string' },
        role: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '유효하지 않은 입력' })
  @ApiResponse({ status: 409, description: '사용자명 중복' })
  async register(@Body() userData: any, @Res() res: Response): Promise<void> {
    try {
      const authServiceUrl =
        process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
      const targetUrl = `${authServiceUrl}/auth/register`;
      const response = await lastValueFrom(
        this.httpService.post(targetUrl, userData, {
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

  @Post('login')
  @ApiOperation({
    summary: '로그인',
    description: '사용자 인증 및 JWT 토큰 발급',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['username', 'password'],
      properties: {
        username: { type: 'string', example: 'user123' },
        password: { type: 'string', example: 'password123' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(@Body() loginData: any, @Res() res: Response): Promise<void> {
    try {
      const authServiceUrl =
        process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
      const targetUrl = `${authServiceUrl}/auth/login`;
      const response = await lastValueFrom(
        this.httpService.post(targetUrl, loginData, {
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

  @Post('verify')
  @ApiOperation({
    summary: '토큰 검증',
    description: 'JWT 토큰의 유효성을 검증합니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['token'],
      properties: {
        token: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '토큰 검증 성공',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '유효하지 않은 토큰' })
  async verify(@Body() verifyData: any, @Res() res: Response): Promise<void> {
    try {
      const authServiceUrl =
        process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
      const targetUrl = `${authServiceUrl}/auth/verify`;
      const response = await lastValueFrom(
        this.httpService.post(targetUrl, verifyData, {
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

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: '내 프로필 조회',
    description: '현재 로그인한 사용자의 프로필 정보를 조회합니다.',
  })
  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: 200,
    description: '프로필 조회 성공',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        username: { type: 'string' },
        role: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getProfile(
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const userData = {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role,
      };
      res.status(200).send(userData);
    } catch (error) {
      res.status(500).send({
        message: 'Failed to retrieve profile',
        error: error.message,
      });
    }
  }
}
