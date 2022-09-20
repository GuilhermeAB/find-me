import { DateVO } from '@find-me/date';
import { ValidationError } from '@find-me/errors';
import { BaseEntityProps, Entity } from '../base/entity.base';

const PERSON_MIN_AGE = 13;
const PERSON_MAX_AGE = 116;

const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 30;

const NAME_REGEX = /^([A-Z][a-z]+([ ]?[a-z]?['-]?[A-Z][a-z]+)*)$/g;

interface PersonProps {
  name: string,
  birthDate: DateVO
}

export interface PersonEntityType extends PersonProps, BaseEntityProps {}

export class PersonEntity extends Entity<PersonProps> {
  public static create({ name, birthDate }: PersonProps): PersonEntity {
    const props: PersonProps = {
      name: name.trim(),
      birthDate,
    };

    const person = new PersonEntity({
      props,
    });

    return person;
  }

  private validateAge(): void {
    const age = DateVO.differenceInYears(DateVO.now(), this.props.birthDate);
    if (age < PERSON_MIN_AGE || age > PERSON_MAX_AGE) {
      throw new ValidationError({
        code: 'BIRTH_DATE_MIN_MAX_AGE',
        params: {
          min: PERSON_MIN_AGE,
          max: PERSON_MAX_AGE,
        },
      });
    }
  }

  private validateNameLength(): void {
    const { length } = this.props.name;
    if (length < NAME_MIN_LENGTH || length > NAME_MAX_LENGTH) {
      throw new ValidationError({
        code: 'NAME_LENGTH',
        params: {
          min: NAME_MIN_LENGTH,
          max: NAME_MAX_LENGTH,
        },
      });
    }
  }

  private validateName(): void {
    if (!this.props.name.match(NAME_REGEX)) {
      throw new ValidationError({ code: 'INVALID_NAME' });
    }
  }

  public validate(): void {
    this.validateAge();
    this.validateNameLength();
    this.validateName();
  }
}
