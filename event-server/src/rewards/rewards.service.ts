// ######################## IMPORT ##########################
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reward, RewardDocument } from './schemas/reward.schema';
import { CreateRewardDto } from './dto/create-reward.dto';
import { EventsService } from '../events/events.service';

// ######################## LOGIC ###########################
@Injectable()
export class RewardsService {
  constructor(
    @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
    private eventsService: EventsService,
  ) {}

  async create(createRewardDto: CreateRewardDto): Promise<Reward> {
    if (!Types.ObjectId.isValid(createRewardDto.eventId)) {
      throw new BadRequestException(
        `Invalid eventId format: ${createRewardDto.eventId}`,
      );
    }
    await this.eventsService.findById(createRewardDto.eventId);
    const newReward = new this.rewardModel({
      ...createRewardDto,
      eventId: new Types.ObjectId(createRewardDto.eventId),
    });
    return newReward.save();
  }

  async findAll(filters?: any): Promise<Reward[]> {
    const safeFilters = {};
    if (filters) {
      if (filters.eventId) {
        if (!Types.ObjectId.isValid(filters.eventId)) {
          throw new BadRequestException(
            `Invalid eventId format: ${filters.eventId}`,
          );
        }
        safeFilters['eventId'] = new Types.ObjectId(filters.eventId);
      }
      if (filters.type) {
        safeFilters['type'] = filters.type;
      }
    }
    return this.rewardModel.find(safeFilters).exec();
  }

  async findById(id: string): Promise<Reward> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid reward ID format: ${id}`);
    }
    const reward = await this.rewardModel.findById(id).exec();
    if (!reward) {
      throw new NotFoundException(`Reward with ID ${id} not found`);
    }
    return reward;
  }

  async findByEventId(eventId: string): Promise<Reward[]> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException(`Invalid eventId format: ${eventId}`);
    }
    return this.rewardModel
      .find({ eventId: new Types.ObjectId(eventId) })
      .exec();
  }
}
