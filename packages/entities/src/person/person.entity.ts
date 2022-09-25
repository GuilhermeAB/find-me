import { DateVO } from '@find-me/date';
import { Entity } from '../base/entity.base';
import { PersonPolicy } from './person.policy';

export interface PersonProps {
  name: string,
  birthDate: DateVO
}

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

  public validate(): void {
    PersonPolicy.validate(this.getProps());
  }
}
