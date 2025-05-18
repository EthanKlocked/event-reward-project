// ######################## IMPORT ##########################
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// ######################## LOGIC ###########################
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    required: true,
    enum: ['USER', 'OPERATOR', 'AUDITOR', 'ADMIN'],
    default: 'USER',
  })
  role: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

// ######################## EXPORT ##########################
export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
