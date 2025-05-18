// ######################## IMPORT ##########################
import { Request } from 'express';

// ######################## EXPORT ##########################
export interface RequestWithUser extends Request {
  user: {
    id: string;
    username: string;
    role: string;
  };
}
