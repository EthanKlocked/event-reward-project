// ######################## IMPORT ##########################
import { Injectable } from '@nestjs/common';
import { ConditionValidator } from './validator.interface';

// ######################## LOGIC ###########################
@Injectable()
export class LoginDaysValidator implements ConditionValidator {
  async validate(userId: string, requiredDays: number): Promise<boolean> {
    // TODO: 실제 구현에서는 로그인 로그 테이블을 조회하여 연속 로그인 일수 확인
    // 샘플 구현으로 항상 true 반환 (조건 충족)
    console.log(
      `Validating login days for user ${userId}: required=${requiredDays}`,
    );
    return true;
  }
}
