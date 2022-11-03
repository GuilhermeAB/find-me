import { database } from '@find-me/database';
import { DateVO } from '@find-me/date';
import { CreatePersonProps, PersonEntity, PersonEntityType } from '@find-me/entities';
import { PersonRepository } from '@find-me/repositories';
import { ValidationError } from '@find-me/errors';

export class PersonService {
  private repository: PersonRepository;

  constructor() {
    this.repository = new PersonRepository();
  }

  public async create(props: CreatePersonProps): Promise<PersonEntity> {
    const entity = PersonEntity.create(props);
    entity.validate();

    await database.startTransaction();
    return this.repository.create(entity);
  }

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
