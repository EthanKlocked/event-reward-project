// ######################## IMPORT ##########################
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Request, RequestDocument } from './schemas/request.schema';
import { CreateRequestDto } from './dto/create-request.dto';
import { ProcessRequestDto } from './dto/process-request.dto';
import { EventsService } from '../events/events.service';
import { RewardsService } from '../rewards/rewards.service';
import { HistoryService } from '../history/history.service';

// ######################## LOGIC ###########################
@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(Request.name) private requestModel: Model<RequestDocument>,
    @InjectConnection() private connection: Connection,
    private eventsService: EventsService,
    private rewardsService: RewardsService,
    private historyService: HistoryService,
  ) {}

  async create(createRequestDto: CreateRequestDto): Promise<Request> {
    const { userId, eventId } = createRequestDto;
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException(`Invalid userId format: ${userId}`);
    }
    if (!Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException(`Invalid eventId format: ${eventId}`);
    }
    const userObjectId = new Types.ObjectId(userId);
    const eventObjectId = new Types.ObjectId(eventId);
    const event = await this.eventsService.findById(eventId);
    const existingRequest = await this.requestModel
      .findOne({
        userId: userObjectId,
        eventId: eventObjectId,
        status: { $in: ['PENDING', 'APPROVED', 'COMPLETED'] },
      })
      .exec();

    if (existingRequest) {
      throw new BadRequestException('Already requested for this event');
    }
    const isConditionMet = await this.eventsService.checkCondition(
      userId,
      eventId,
    );
    if (!isConditionMet) {
      throw new BadRequestException('Event conditions are not met');
    }
    const newRequest = new this.requestModel({
      userId: userObjectId,
      eventId: eventObjectId,
      status: 'PENDING',
      requestedAt: new Date(),
    });

    await newRequest.save();

    // 자동 검증 이벤트인 경우 바로 처리
    if (event.verificationType === 'AUTO') {
      await this.processRequest(String(newRequest._id), {
        status: 'APPROVED',
      });
      return this.findById(String(newRequest._id));
    }
    return newRequest;
  }

  async processRequest(
    id: string,
    processRequestDto: ProcessRequestDto,
  ): Promise<Request> {
    const { status, processedBy } = processRequestDto;
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid request ID format: ${id}`);
    }
    if (processedBy && !Types.ObjectId.isValid(processedBy)) {
      throw new BadRequestException(
        `Invalid processedBy ID format: ${processedBy}`,
      );
    }
    const request = await this.findById(id);
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Request has already been processed');
    }
    request.status = status;
    if (status === 'APPROVED') {
      const rewards = await this.rewardsService.findByEventId(
        String(request.eventId),
      );
      if (!rewards || rewards.length === 0) {
        throw new BadRequestException(
          'No rewards found for this event. Cannot approve the request.',
        );
      }
    }
    request.processedAt = new Date();
    if (processedBy) {
      request.processedBy = new Types.ObjectId(processedBy);
    }
    await request.save();
    if (status === 'APPROVED') {
      return this.issueRewards(request);
    }
    return request;
  }

  async issueRewards(request: RequestDocument): Promise<Request> {
    const rewards = await this.rewardsService.findByEventId(
      String(request.eventId),
    );
    if (!rewards || rewards.length === 0) {
      throw new BadRequestException('No rewards found for this event');
    }
    try {
      for (const reward of rewards) {
        const rewardId = (reward as any)._id;

        await this.historyService.create({
          requestId: request._id,
          userId: request.userId,
          eventId: request.eventId,
          rewardId: rewardId,
          quantity: reward.quantity,
          issuedAt: new Date(),
        });

        // 실제 보상 지급 로직 구현 예정임
        // console.log(`Reward issued: ${reward.type} ${reward.name} x${reward.quantity} to user ${request.userId}`);
      }
      request.status = 'COMPLETED';
      await request.save();
      return request;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to issue rewards: ${error.message}`,
      );
    }
  }

  async findById(id: string): Promise<RequestDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid request ID format: ${id}`);
    }
    const request = await this.requestModel.findById(id).exec();
    if (!request) {
      throw new NotFoundException(`Request with ID ${id} not found`);
    }
    return request;
  }

  async findAll(filters?: any): Promise<Request[]> {
    const safeFilters = {};
    if (filters) {
      if (filters.userId) {
        if (!Types.ObjectId.isValid(filters.userId)) {
          throw new BadRequestException(
            `Invalid userId format: ${filters.userId}`,
          );
        }
        safeFilters['userId'] = new Types.ObjectId(filters.userId);
      }
      if (filters.eventId) {
        if (!Types.ObjectId.isValid(filters.eventId)) {
          throw new BadRequestException(
            `Invalid eventId format: ${filters.eventId}`,
          );
        }
        safeFilters['eventId'] = new Types.ObjectId(filters.eventId);
      }
      if (filters.status) {
        safeFilters['status'] = filters.status;
      }
    }
    return this.requestModel.find(safeFilters || {}).exec();
  }

  async findByUserId(userId: string): Promise<Request[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException(`Invalid userId format: ${userId}`);
    }
    return this.requestModel
      .find({ userId: new Types.ObjectId(userId) })
      .exec();
  }
}
