// ######################## IMPORT ##########################
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

// ######################## LOGIC ###########################
@Schema({ timestamps: true })
export class Event {
  _id?: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  status: string;

  @Prop({ required: true })
  conditionType: string;

  @Prop({ required: true })
  conditionValue: number;

  @Prop({ required: true, enum: ['AUTO', 'MANUAL'], default: 'AUTO' })
  verificationType: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  createdBy: Types.ObjectId;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

// ######################## EXPORT ##########################
export type EventDocument = Event & Document;
export const EventSchema = SchemaFactory.createForClass(Event);
