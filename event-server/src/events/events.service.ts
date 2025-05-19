// ######################## IMPORT ##########################
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ValidatorFactory } from '../validators/validator.factory';

// ######################## LOGIC ###########################
@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    private validatorFactory: ValidatorFactory,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const newEvent = new this.eventModel(createEventDto);
    return newEvent.save();
  }

  async findAll(filters?: any): Promise<Event[]> {  
    if (filters?.createdBy && !Types.ObjectId.isValid(filters.createdBy)) {
      throw new BadRequestException(`Invalid createdBy ID format: ${filters.createdBy}`);
    }
    return this.eventModel.find(filters || {}).exec();
  }

  async findById(id: string): Promise<Event> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid event ID format: ${id}`);
    }
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid event ID format: ${id}`);
    }
    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true })
      .exec();
    if (!updatedEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return updatedEvent;
  }

  async checkCondition(userId: string, eventId: string): Promise<boolean> {
    const event = await this.findById(eventId);
    if (event.status !== 'ACTIVE') {
      throw new BadRequestException('Event is not active');
    }
    const now = new Date();
    if (now < event.startDate || now > event.endDate) {
      throw new BadRequestException('Event is not in the valid date range');
    }
    // 수동 검증 이벤트인 경우 항상 true 반환 (운영자가 나중에 검토)
    if (event.verificationType === 'MANUAL') {
      return true;
    }
    // 자동 검증 이벤트인 경우 조건 검증기 실행
    const validator = this.validatorFactory.getValidator(event.conditionType);
    return validator.validate(userId, event.conditionValue);
  }
}
