import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { getModelToken } from '@nestjs/mongoose';
import { Event } from './schemas/event.schema';
import { ValidatorFactory } from '../validators/validator.factory';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('EventsService', () => {
  let service: EventsService;
  let validatorFactory: ValidatorFactory;

  const mockEventModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findOne: jest.fn(),
    new: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
  };

  const mockEvent = {
    _id: new Types.ObjectId().toString(),
    title: 'Test Event',
    description: 'Test Description',
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000), // 1 day later
    status: 'ACTIVE',
    conditionType: 'LOGIN_DAYS',
    conditionValue: 7,
    verificationType: 'AUTO',
    createdBy: new Types.ObjectId().toString(),
  };

  const mockValidator = {
    validate: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getModelToken(Event.name),
          useValue: mockEventModel,
        },
        {
          provide: ValidatorFactory,
          useValue: {
            getValidator: jest.fn().mockReturnValue(mockValidator),
          },
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    validatorFactory = module.get<ValidatorFactory>(ValidatorFactory);

    mockEventModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockEvent),
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should throw BadRequestException for invalid ID format', async () => {
      await expect(service.findById('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if event not found', async () => {
      mockEventModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.findById(new Types.ObjectId().toString()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return event if found', async () => {
      const result = await service.findById(mockEvent._id);
      expect(result).toEqual(mockEvent);
    });
  });

  describe('checkCondition', () => {
    it('should throw BadRequestException for inactive events', async () => {
      mockEventModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({
          ...mockEvent,
          status: 'INACTIVE',
        }),
      });

      await expect(
        service.checkCondition('user-id', mockEvent._id),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for events outside date range', async () => {
      mockEventModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({
          ...mockEvent,
          startDate: new Date(Date.now() + 86400000), // 1 day later
        }),
      });

      await expect(
        service.checkCondition('user-id', mockEvent._id),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return true for MANUAL verification', async () => {
      mockEventModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({
          ...mockEvent,
          verificationType: 'MANUAL',
        }),
      });

      const result = await service.checkCondition('user-id', mockEvent._id);
      expect(result).toBe(true);
    });

    it('should use validator for AUTO verification', async () => {
      const result = await service.checkCondition('user-id', mockEvent._id);

      expect(validatorFactory.getValidator).toHaveBeenCalledWith(
        mockEvent.conditionType,
      );
      expect(mockValidator.validate).toHaveBeenCalledWith(
        'user-id',
        mockEvent.conditionValue,
      );
      expect(result).toBe(true);
    });
  });
});
