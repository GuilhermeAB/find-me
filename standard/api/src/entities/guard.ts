import { ValidationError, ValidationErrorProps } from '@find-me/errors';
import { UUID } from '@find-me/uuid';
import { DateVO } from '@find-me/date';

export class Guard {
  public static required(value: unknown, error: ValidationErrorProps): void {
    if (value == null || (typeof value === 'string' && !value.length)) {
      throw new ValidationError(error);
    }
  }

  public static isUUID(value: unknown, isOptional?: boolean): void {
    if (isOptional && value == null) {
      return;
    }

    UUID.generate(String(value));
  }

  public static isDate(value: unknown, isOptional?: boolean): void {
    if (isOptional && value == null) {
      return;
    }

    DateVO.generate(String(value));
  }

  public static isString(value: unknown, error: ValidationErrorProps, isOptional?: boolean): void {
    if (isOptional && value == null) {
      return;
    }

    if (typeof value !== 'string') {
      throw new ValidationError(error);
    }
  }

  public static isNumber(value: unknown, error: ValidationErrorProps, isOptional?: boolean): void {
    if (isOptional && value == null) {
      return;
    }

    if (typeof value !== 'number') {
      throw new ValidationError(error);
    }
  }

  public static isBoolean(value: unknown, error: ValidationErrorProps, isOptional?: boolean): void {
    if (isOptional && value == null) {
      return;
    }

    if ((!['true', 'false'].some((k) => k === value) && typeof value !== 'boolean')) {
      throw new ValidationError(error);
    }
  }
}
