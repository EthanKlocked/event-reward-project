// ######################## IMPORT ##########################
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { History, HistoryDocument } from './schemas/history.schema';

// ######################## LOGIC ###########################
@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(History.name) private historyModel: Model<HistoryDocument>,
  ) {}

  async create(historyData: any): Promise<History> {
    const transformedData = {
      ...historyData,
      requestId: new Types.ObjectId(historyData.requestId),
      userId: new Types.ObjectId(historyData.userId),
      eventId: new Types.ObjectId(historyData.eventId),
      rewardId: new Types.ObjectId(historyData.rewardId),
    };
    const newHistory = new this.historyModel(historyData);
    return newHistory.save();
  }

  async findAll(filters?: any): Promise<History[]> {
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
    }

    return this.historyModel.find(safeFilters).exec();
  }

  async findByUserId(userId: string): Promise<History[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException(`Invalid userId format: ${userId}`);
    }
    return this.historyModel
      .find({ userId: new Types.ObjectId(userId) })
      .exec();
  }

  async findByEventId(eventId: string): Promise<History[]> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException(`Invalid eventId format: ${eventId}`);
    }
    return this.historyModel
      .find({ eventId: new Types.ObjectId(eventId) })
      .exec();
  }
}
