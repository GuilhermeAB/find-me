import { database } from '@find-me/database';
import { ValidationError } from '@find-me/errors';
import { DateVO } from '@find-me/date';
import { PersonEntityType } from '@find-me/entities';
import { PersonService } from '../index';

export class PersonUpdateService extends PersonService {
  public async update(id: string, name?: string, birthDate?: DateVO): Promise<Partial<PersonEntityType>> {
    await database.startTransaction();
    const person = await this.repository.findOneById(id);

    if (!person) {
      throw new ValidationError({ key: 'PersonNotFound' });
    }

    person.update({ name, birthDate });

    const result = await this.repository.update(person);

    return result.getFlatProps();
  }
}
