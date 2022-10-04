import { DateVO } from '@find-me/date';
import { ValidationError } from '@find-me/errors';
import { PersonEntityType } from '.';
import { Policy } from '../base/policy.base';

const MIN_AGE = 13;
const MAX_AGE = 116;

const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 30;

const NAME_REGEX = /^([A-Z][a-z]+([ ]?[a-z]?['-]?[A-Z][a-z]+)*)$/g;

export class PersonPolicy extends Policy {
  private static validateAge(birthDate: DateVO): void {
    if (!PersonPolicy.ageIsBetween(birthDate, MIN_AGE, MAX_AGE)) {
      throw new ValidationError({
        key: 'BIRTH_DATE_MIN_MAX_AGE',
        params: {
          min: MIN_AGE,
          max: MAX_AGE,
        },
      });
    }
  }

  private static validateNameLength(name: string): void {
    if (!PersonPolicy.lengthIsBetween(name, NAME_MIN_LENGTH, NAME_MAX_LENGTH)) {
      throw new ValidationError({
        key: 'NAME_LENGTH',
        params: {
          min: NAME_MIN_LENGTH,
          max: NAME_MAX_LENGTH,
        },
      });
    }
  }

  private static validateName(name: string): void {
    if (!PersonPolicy.matchRegex(name, NAME_REGEX)) {
      throw new ValidationError({ key: 'INVALID_NAME' });
    }
  }

  public static validate(props: PersonEntityType): void {
    PersonPolicy.validateAge(props.birthDate);
    PersonPolicy.validateNameLength(props.name);
    PersonPolicy.validateName(props.name);
  }
}
