// gateway-server/test/auth.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ConfigModule } from '@nestjs/config';
import * as nock from 'nock';

describe('Auth API (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Mock AUTH_SERVICE_URL 환경변수
    process.env.AUTH_SERVICE_URL = 'http://mock-auth-service';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    nock.cleanAll();
  });

  beforeEach(() => {
    // Clear all nock interceptors
    nock.cleanAll();
  });

  it('should register a new user', async () => {
    // Mock auth server response
    nock('http://mock-auth-service').post('/auth/register').reply(201, {
      _id: 'user-id',
      username: 'testuser',
      role: 'USER',
      createdAt: new Date().toISOString(),
    });

    // Test gateway endpoint
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: 'testuser',
        password: 'password123',
        role: 'USER',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('username', 'testuser');
        expect(res.body).toHaveProperty('role', 'USER');
      });
  });

  it('should login and return a token', async () => {
    // Mock auth server response
    nock('http://mock-auth-service').post('/auth/login').reply(200, {
      access_token: 'mock-jwt-token',
    });

    // Test gateway endpoint
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'testuser',
        password: 'password123',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
      });
  });

  it('should verify a token', async () => {
    // Mock auth server response
    nock('http://mock-auth-service')
      .post('/auth/verify')
      .reply(200, {
        user: {
          id: 'user-id',
          username: 'testuser',
          role: 'USER',
        },
      });

    // Test gateway endpoint
    return request(app.getHttpServer())
      .post('/auth/verify')
      .set('Authorization', 'Bearer mock-jwt-token')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).toHaveProperty('id');
        expect(res.body.user).toHaveProperty('username');
        expect(res.body.user).toHaveProperty('role');
      });
  });
});
