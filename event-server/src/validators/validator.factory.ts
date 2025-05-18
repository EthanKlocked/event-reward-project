// ######################## IMPORT ##########################
import { Injectable } from '@nestjs/common';
import { ConditionValidator } from './validator.interface';
import { LoginDaysValidator } from './login-days.validator';
import { FriendInviteValidator } from './friend-invite.validator';
import { ConditionType } from './condition-type.enum';

// ######################## LOGIC ###########################
@Injectable()
export class ValidatorFactory {
  constructor(
    private readonly loginDaysValidator: LoginDaysValidator,
    private readonly friendInviteValidator: FriendInviteValidator,
  ) {}

  getValidator(conditionType: string): ConditionValidator {
    switch (conditionType) {
      case ConditionType.LOGIN_DAYS:
        return this.loginDaysValidator;
      case ConditionType.INVITE_FRIENDS:
        return this.friendInviteValidator;
      default:
        throw new Error(`Unknown condition type: ${conditionType}`);
    }
  }
}
