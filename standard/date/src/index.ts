import { ValidationError } from '@find-me/errors';
import { differenceInYears } from 'date-fns';

export interface DateVOProps {
  value: Date
}

function validateDate(value: Date): void {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new ValidationError({ key: 'InvalidDate' });
  }
}

export class DateVO {
  private props: DateVOProps;

  public get value(): Date {
    return this.props.value;
  }

  constructor(value: Date | string | number | DateVO) {
    const date = value instanceof DateVO ? value.value : new Date(value);

    this.props = {
      value: date,
    };

    this.validate();
  }

  public static generate(value: string | DateVO): DateVO {
    if (value instanceof DateVO) {
      return value;
    }

    return new DateVO(value);
  }

  public static now(): DateVO {
    return new DateVO(Date.now());
  }

  private validate(): void {
    validateDate(this.value);
  }

  public static validate(value: Date): void {
    validateDate(value);
  }

  public static differenceInYears(dateLeft: Date | number | DateVO, dateRight: Date | number | DateVO): number {
    const valueLeft = dateLeft instanceof DateVO ? dateLeft.value : dateLeft;
    const valueRight = dateRight instanceof DateVO ? dateRight.value : dateRight;

    return differenceInYears(valueLeft, valueRight);
  }
}
