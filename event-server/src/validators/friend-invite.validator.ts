// ######################## IMPORT ##########################
import { Injectable } from '@nestjs/common';
import { ConditionValidator } from './validator.interface';

// ######################## LOGIC ###########################
@Injectable()
export class FriendInviteValidator implements ConditionValidator {
  async validate(userId: string, requiredInvites: number): Promise<boolean> {
    // TODO: 실제 구현에서는 유저의 친구 초대 데이터를 조회하여 확인
    // 샘플 구현으로 항상 true 반환 (조건 충족)
    console.log(
      `Validating friend invites for user ${userId}: required=${requiredInvites}`,
    );
    return true;
  }
}
