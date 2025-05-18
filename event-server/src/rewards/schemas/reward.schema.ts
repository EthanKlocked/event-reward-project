// ######################## IMPORT ##########################
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

// ######################## LOGIC ###########################
@Schema({ timestamps: true })
export class Reward {
  _id?: Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  eventId: Types.ObjectId;

  @Prop({ required: true, enum: ['POINT', 'ITEM', 'COUPON'] })
  type: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  quantity: number;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

// ######################## EXPORT ##########################
export type RewardDocument = Reward & Document;
export const RewardSchema = SchemaFactory.createForClass(Reward);
