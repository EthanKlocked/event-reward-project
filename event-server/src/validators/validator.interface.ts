export interface ConditionValidator {
  validate(userId: string, conditionValue: number): Promise<boolean>;
}
