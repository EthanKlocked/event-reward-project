// ######################## IMPORT ##########################
import { SetMetadata } from '@nestjs/common';

// ######################## LOGIC ###########################
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
