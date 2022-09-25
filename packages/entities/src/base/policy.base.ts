import { DateVO } from '@find-me/date';

export class Policy {
  protected static matchRegex(value: string, regex: RegExp): boolean {
    if (!value.match(regex)) {
      return false;
    }
    return true;
  }

  protected static lengthIsBetween(
    value: number | string,
    min: number,
    max: number,
  ): boolean {
    const valueLength = typeof value === 'number'
      ? Number(value).toString().length
      : value.length;

    if (valueLength < min || valueLength > max) {
      return false;
    }
    return true;
  }

  protected static ageIsBetween(birthDate: DateVO | Date, min: number, max: number): boolean {
    const age = DateVO.differenceInYears(DateVO.now(), birthDate);

    if (age < min || age > max) {
      return false;
    }
    return true;
  }
}
