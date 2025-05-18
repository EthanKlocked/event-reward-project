// ######################## IMPORT ##########################
import { Module } from '@nestjs/common';
import { ValidatorFactory } from './validator.factory';
import { LoginDaysValidator } from './login-days.validator';
import { FriendInviteValidator } from './friend-invite.validator';

// ######################## LOGIC ###########################
@Module({
  providers: [ValidatorFactory, LoginDaysValidator, FriendInviteValidator],
  exports: [ValidatorFactory],
})

// ######################## EXPORT ##########################
export class ValidatorsModule {}
