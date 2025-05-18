// ######################## IMPORT ##########################
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

// ######################## LOGIC ###########################
@Schema({ timestamps: true })
export class History {
  _id?: Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  requestId: Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  userId: Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  eventId: Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  rewardId: Types.ObjectId;

  @Prop({ required: true })
  quantity: number;

  @Prop({ default: Date.now })
  issuedAt: Date;
}

// ######################## EXPORT ##########################
export type HistoryDocument = History & Document;
export const HistorySchema = SchemaFactory.createForClass(History);
