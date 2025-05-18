// ######################## IMPORT ##########################
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

// ######################## LOGIC ###########################
@Schema({ timestamps: true })
export class Request {
  _id?: Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  userId: Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  eventId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'],
    default: 'PENDING',
  })
  status: string;

  @Prop({ default: Date.now })
  requestedAt: Date;

  @Prop()
  processedAt?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  processedBy?: Types.ObjectId;
}

// ######################## EXPORT ##########################
export type RequestDocument = Request & Document;
export const RequestSchema = SchemaFactory.createForClass(Request);
